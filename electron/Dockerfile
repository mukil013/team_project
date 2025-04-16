
FROM node:22

RUN apt-get update && apt-get install -y \
    xvfb \
    libgtk-3-0 \
    libx11-xcb1 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    libasound2 \
    libxshmfence1 \
    libgbm1 \
    libxext6 \
    libxi6 \
    libglu1-mesa \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["xvfb-run", "npm", "start"]
