// src/pages/Dashboard.tsx
import React from 'react';
import { Card, Typography, Table, Row, Col, Statistic } from 'antd';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, BarChart, Bar } from 'recharts';

const { Title, Text } = Typography;

const usageData = [
  { month: 'Jan', usage: 65 },
  { month: 'Feb', usage: 59 },
  { month: 'Mar', usage: 80 },
  { month: 'Apr', usage: 81 },
  { month: 'May', usage: 56 },
  { month: 'Jun', usage: 55 },
  { month: 'Jul', usage: 40 },
];

const productivityData = [
  { month: 'Jan', productivity: 70 },
  { month: 'Feb', productivity: 65 },
  { month: 'Mar', productivity: 85 },
  { month: 'Apr', productivity: 80 },
  { month: 'May', productivity: 75 },
  { month: 'Jun', productivity: 70 },
  { month: 'Jul', productivity: 60 },
];

const columns = [
  {
    title: 'ID',
    dataIndex: 'id',
    key: 'id',
  },
  {
    title: 'Model',
    dataIndex: 'model',
    key: 'model',
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
  },
  {
    title: 'Last Maintenance',
    dataIndex: 'lastMaintenance',
    key: 'lastMaintenance',
  },
];

const inventoryData = [
  { id: 'L001', model: 'Model A', status: 'Available', lastMaintenance: '2023-10-01' },
  { id: 'L002', model: 'Model B', status: 'In Use', lastMaintenance: '2023-09-15' },
  // Add more rows as needed
];

const employeeData = [
  { id: 'E001', name: 'John Doe', status: 'Active' },
  { id: 'E002', name: 'Jane Smith', status: 'Inactive' },
  { id: 'E003', name: 'Alice Johnson', status: 'Active' },
  { id: 'E004', name: 'Bob Brown', status: 'Inactive' },
  // Add more rows as needed
];

const activeEmployees = employeeData.filter(emp => emp.status === 'Active').length;
const inactiveEmployees = employeeData.filter(emp => emp.status === 'Inactive').length;

const Dashboard = () => {
  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={[16, 16]}>
        <Col span={8}>
          <Card>
            <Statistic title="Total Lathes" value={150} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Available Lathes" value={100} />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="In Use Lathes" value={50} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card>
            <Title level={4}>Usage Trend</Title>
            <LineChart width={600} height={250} data={usageData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="usage" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Title level={4}>Employee Productivity</Title>
            <LineChart width={600} height={250} data={productivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="productivity" stroke="#ff7300" activeDot={{ r: 8 }} />
            </LineChart>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col span={12}>
          <Card>
            <Title level={4}>Active and Inactive Employees</Title>
            <Row gutter={[16, 16]}>
              <Col span={12}>
                <Card>
                  <Statistic title="Active Employees" value={activeEmployees} />
                </Card>
              </Col>
              <Col span={12}>
                <Card>
                  <Statistic title="Inactive Employees" value={inactiveEmployees} />
                </Card>
              </Col>
            </Row>
          </Card>
        </Col>
        <Col span={12}>
          <Card>
            <Title level={4}>Inventory List</Title>
            <Table columns={columns} dataSource={inventoryData} pagination={{ pageSize: 5 }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;