from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import numpy as np
from sklearn.linear_model import LinearRegression
from datetime import datetime, timezone
import os
import logging

app = Flask(__name__)
CORS(app)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def fetch_machines_from_nodejs(company_uid: str) -> list:
    try:
        NODEJS_API_URL = "http://localhost:3000"
        response = requests.get(f"{NODEJS_API_URL}/api/machines/{company_uid}", timeout=10)
        response.raise_for_status()
        machines = response.json()

        if not isinstance(machines, list):
            logger.error("Invalid data format: Expected a list of machines")
            raise ValueError("Invalid data format: Expected a list of machines")

        return machines
    except requests.exceptions.RequestException as e:
        logger.error(f"Failed to fetch machines from Node.js backend: {str(e)}")
        raise RuntimeError(f"Failed to fetch machines: {str(e)}")

@app.route('/predict-service', methods=['POST'])
def predict_service():
    try:
        data = request.json
        company_uid = data.get("companyUid")
        machine_uid = data.get("machineUid")

        if not company_uid or not machine_uid:
            logger.warning("companyUid and machineUid are required")
            return jsonify({"error": "companyUid and machineUid are required"}), 400

        machines = fetch_machines_from_nodejs(company_uid)
        machine = next((m for m in machines if m.get("_id") == machine_uid), None)

        if not machine:
            logger.warning(f"Machine with UID {machine_uid} not found")
            return jsonify({"error": "Machine not found"}), 404

        service_dates = machine.get("serviceDate", [])
        if len(service_dates) < 2:
            return jsonify({
                "message": "Insufficient service history (at least 2 dates required)",
                "predicted_service_date": None
            }), 200

        # Parse and sort service dates
        valid_dates = []
        for date_str in service_dates:
            try:
                # Handle 'Z' suffix for UTC
                normalized_date_str = date_str.replace("Z", "+00:00")
                dt = datetime.fromisoformat(normalized_date_str)
                valid_dates.append(dt)
            except ValueError as e:
                logger.warning(f"Invalid service date {date_str}: {e}")
                continue

        if len(valid_dates) < 2:
            return jsonify({
                "message": "Insufficient valid service dates",
                "predicted_service_date": None
            }), 200

        valid_dates.sort()  # Sort dates in ascending order

        # Prepare data for model
        X = np.array(range(1, len(valid_dates) + 1)).reshape(-1, 1)
        y = np.array([d.timestamp() for d in valid_dates])

        try:
            model = LinearRegression().fit(X, y)
        except Exception as e:
            logger.error(f"Model training failed: {e}")
            return jsonify({
                "message": "Model training failed",
                "predicted_service_date": None
            }), 200

        # Predict next service date
        next_service_num = len(valid_dates) + 1
        predicted_timestamp = model.predict([[next_service_num]])[0]
        predicted_date = datetime.fromtimestamp(predicted_timestamp, tz=timezone.utc).isoformat()

        # Calculate confidence (R-squared score)
        confidence = float(model.score(X, y))

        return jsonify({
            "predicted_service_date": predicted_date,
            "confidence": confidence
        }), 200

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}", exc_info=True)
        return jsonify({"error": "Prediction failed"}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)