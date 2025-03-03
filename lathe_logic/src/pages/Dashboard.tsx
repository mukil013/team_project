import React, { useState, useEffect } from "react";
import { Card, Typography, Table, Row, Col, Statistic, message } from "antd";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import axios from "axios";

const { Title } = Typography;

// Define types for data structures
interface UsageData {
  date: string;
  [key: string]: number | string; // Allow dynamic keys for machine names
}

interface MachineData {
  id: number;
  name: string;
  usageTime: { time: number; date: string }[];
  serviceDate: string[];
}

interface EmployeeData {
  id: number;
  name: string;
  status: string;
  role: string;
}

const Dashboard: React.FC = () => {
  const [usageData, setUsageData] = useState<UsageData[]>([]);
  const [machineData, setMachineData] = useState<MachineData[]>([]);
  const [employeeData, setEmployeeData] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const companyUid = JSON.parse(sessionStorage.getItem("user") || "{}").companyUid;

  // Fetch real data from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch machine data
        const machinesResponse = await axios.get(
          `http://localhost:3000/api/machines/${companyUid}`
        );
        setMachineData(machinesResponse.data);

        // Fetch employee data
        const employeesResponse = await axios.get(
          `http://localhost:3000/api/company/employees/${companyUid}`
        );
        setEmployeeData(employeesResponse.data);

        // Group usage data by date and machine
        const groupedUsageData: { [key: string]: UsageData } = {};
        machinesResponse.data.forEach((machine: MachineData) => {
          machine.usageTime.forEach((usage) => {
            const dateKey = usage.date.split("T")[0]; // Extract only the date part
            if (!groupedUsageData[dateKey]) {
              groupedUsageData[dateKey] = { date: dateKey };
            }
            groupedUsageData[dateKey][machine.name] = usage.time; // Add machine-specific usage
          });
        });

        // Convert grouped data into an array
        const mergedUsageData = Object.values(groupedUsageData).sort(
          (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        setUsageData(mergedUsageData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        message.error("Failed to fetch data");
        setLoading(false);
      }
    };

    fetchData();
  }, [companyUid]);

  // Calculate active and inactive employees
  const activeEmployees = employeeData.filter((emp) => emp.status === "Active").length;
  const inactiveEmployees = employeeData.filter((emp) => emp.status === "Inactive").length;

  // Define table columns for employees
  const employeeColumns = [
    {
      title: "Name",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
  ];

  // Define table columns for machines
  const machineColumns = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "Usage Time",
      dataIndex: "usageTime",
      key: "usageTime",
      render: (text: { time: number; date: string }[]) =>
        text.map((item) => `${item.time} hours at ${item.date.split("T")[0]}`).join(", "), // Extract only the date part
    },
    {
      title: "Service Dates",
      dataIndex: "serviceDate",
      key: "serviceDate",
      render: (text: string[]) => text.map((date) => date.split("T")[0]).join(", "), // Extract only the date part
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Statistics */}
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Title level={3}>Active Employees</Title>
            <Statistic title="Count" value={activeEmployees} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Title level={3}>Inactive Employees</Title>
            <Statistic title="Count" value={inactiveEmployees} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Title level={3}>Total Machines</Title>
            <Statistic title="Count" value={machineData.length} />
          </Card>
        </Col>
      </Row>

      {/* Row 2: Usage Time Line Chart */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={3}>Machine Usage Over Time</Title>
            <LineChart
              width={1200}
              height={400}
              data={usageData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              {/* Render a line for each machine */}
              {machineData.map((machine) => (
                <Line
                  key={machine.id}
                  type="monotone"
                  dataKey={machine.name}
                  stroke={`#${Math.floor(Math.random() * 16777215).toString(16)}`} // Random color
                  name={machine.name}
                />
              ))}
            </LineChart>
          </Card>
        </Col>
      </Row>

      {/* Row 3: Employee List */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={3}>Employee List</Title>
            <Table
              columns={employeeColumns}
              dataSource={employeeData}
              loading={loading}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* Row 4: Machine List */}
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <Title level={3}>Machine List</Title>
            <Table
              columns={machineColumns}
              dataSource={machineData}
              loading={loading}
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;