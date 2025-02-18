// src/pages/SandM.tsx
import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Tooltip,
  Modal,
  Typography,
  Space,
  Table,
  Tabs,
  Form,
  Input,
  message,
} from "antd";
import {
  InfoCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  CloseOutlined,
} from "@ant-design/icons";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts";
import axios from "axios";

const { Title, Text } = Typography;
const { TabPane } = Tabs;

interface Machine {
  _id: string;
  name: string;
  usageTime: number;
  serviceTime: number;
  maintenanceTime: number;
  predictedServiceTime: number;
  predictedMaintenanceTime: number;
  companyUid: string;
}

const SandM: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [adminCompanyUid, setAdminCompanyUid] = useState<string>("");

  useEffect(() => {
    // Fetch admin details from sessionStorage or any other storage
    const adminDetails = JSON.parse(sessionStorage.getItem("user") || "{}");
    setAdminCompanyUid(adminDetails.companyUid || "");
    // Fetch machines by companyUid
    fetchMachinesByCompanyUid(adminDetails.companyUid);
  }, []);

  const fetchMachinesByCompanyUid = async (companyUid: string) => {
    if (!companyUid) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/api/machines/${companyUid}`
      );
      setMachines(response.data);
    } catch (error) {
      message.error("Failed to fetch machines");
    }
  };

  const showModal = (machine: Machine | null = null) => {
    setEditingMachine(machine);
    form.setFieldsValue({
      ...(machine || {}),
    });
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleOk = async () => {
    form.validateFields().then(async (values: Partial<Machine>) => {
      try {
        if (editingMachine) {
          // Update existing machine
          const updatedMachine: Machine = {
            ...editingMachine,
            ...values,
          };
          await axios.put(
            `http://localhost:3000/api/machines/${editingMachine._id}`,
            updatedMachine
          );
          message.success("Machine updated successfully!");
        } else {
          // Add new machine
          const newMachine: Machine = {
            ...values,
            companyUid: adminCompanyUid,
          } as Machine;
          await axios.post("http://localhost:3000/api/machines", newMachine);
          message.success("Machine added successfully!");
        }
        // Fetch machines again to refresh the list
        fetchMachinesByCompanyUid(adminCompanyUid);
        setIsModalVisible(false);
        form.resetFields();
      } catch (error) {
        message.error("Failed to save machine");
      }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/machines/${id}`);
      // Fetch machines again to refresh the list
      fetchMachinesByCompanyUid(adminCompanyUid);
      message.success("Machine deleted successfully!");
    } catch (error) {
      message.error("Failed to delete machine");
    }
  };

  const handleCloseGraph = () => {
    setSelectedMachine(null);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Machine) => (
        <Button type="link" onClick={() => setSelectedMachine(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: "Usage Time (hours)",
      dataIndex: "usageTime",
      key: "usageTime",
    },
    {
      title: "Service Time (hours)",
      dataIndex: "serviceTime",
      key: "serviceTime",
    },
    {
      title: "Maintenance Time (hours)",
      dataIndex: "maintenanceTime",
      key: "maintenanceTime",
    },
    {
      title: "Predicted Service Time (hours)",
      dataIndex: "predictedServiceTime",
      key: "predictedServiceTime",
    },
    {
      title: "Predicted Maintenance Time (hours)",
      dataIndex: "predictedMaintenanceTime",
      key: "predictedMaintenanceTime",
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Machine) => (
        <>
          <Button
            type="link"
            onClick={() => showModal(record)}
            icon={<EditOutlined />}
          ></Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record._id)}
            icon={<DeleteOutlined />}
          ></Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div className="flex items-center justify-between">
        <Title level={2}>
          Service & Maintenance
          <Space size="middle">
            <Tooltip title="AI is used to predict maintenance needs and optimize usage times.">
              <Button
                type="link"
                icon={<InfoCircleOutlined />}
                onClick={showModal}
              />
            </Tooltip>
          </Space>
        </Title>
        <Button
          type="primary"
          onClick={() => showModal()}
          style={{ marginBottom: 16 }}
        >
          Add Machine
        </Button>
      </div>
      {selectedMachine && (
        <Card
          title={`Usage Report for ${selectedMachine.name}`}
          style={{ marginBottom: "24px", position: "relative" }}
        >
          <Button
            type="plain"
            icon={<CloseOutlined />}
            onClick={handleCloseGraph}
            style={{ position: "absolute", top: 8, right: 8, zIndex: 1 }}
          />
          <BarChart width={730} height={300} data={[selectedMachine]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <ChartTooltip />
            <Legend />
            <Bar
              dataKey="usageTime"
              stackId="a"
              fill="#8884d8"
              name="Usage Time"
            />
            <Bar
              dataKey="serviceTime"
              stackId="a"
              fill="#82ca9d"
              name="Service Time"
            />
            <Bar
              dataKey="maintenanceTime"
              stackId="a"
              fill="#ffc658"
              name="Maintenance Time"
            />
            <Bar
              dataKey="predictedServiceTime"
              stackId="b"
              fill="#ff7300"
              name="Predicted Service Time"
            />
            <Bar
              dataKey="predictedMaintenanceTime"
              stackId="b"
              fill="#ff0073"
              name="Predicted Maintenance Time"
            />
          </BarChart>
        </Card>
      )}
      <Card title="Machines">
        <Table
          columns={columns}
          dataSource={machines}
          rowKey="_id"
          pagination={{ pageSize: 5 }}
        />
      </Card>
      <Modal
        title={`${editingMachine ? "Edit" : "Add"} Machine`}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical" initialValues={editingMachine}>
          <Form.Item
            name="name"
            label="Name"
            rules={[{ required: true, message: "Please enter the name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="usageTime"
            label="Usage Time"
            rules={[{ required: true, message: "Please enter the usage time" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="serviceTime"
            label="Service Time"
            rules={[
              { required: true, message: "Please enter the service time" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="maintenanceTime"
            label="Maintenance Time"
            rules={[
              { required: true, message: "Please enter the maintenance time" },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SandM;
