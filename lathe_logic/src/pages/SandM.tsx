import React, { useState, useEffect } from "react";
import {
  Card,
  Button,
  Modal,
  Typography,
  Space,
  Table,
  Form,
  Input,
  message,
  Tag,
  DatePicker,
} from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import moment, { Moment } from "moment";

const { Text } = Typography;

interface Machine {
  _id: string;
  name: string;
  usageTime: { time: number; date: Date }[];
  serviceDate: string[]; // Changed to string[] for ISO dates
  predictedServiceDate?: string | null;
  companyUid: string;
}

const SandM: React.FC = () => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [filteredMachines, setFilteredMachines] = useState<Machine[]>([]); // For filtered results
  const [selectedMachine, setSelectedMachine] = useState<Machine | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [adminCompanyUid, setAdminCompanyUid] = useState("");
  const [selectedDates, setSelectedDates] = useState<Moment[]>([]);
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    const adminDetails = JSON.parse(sessionStorage.getItem("user") || "{}");
    const companyUid = adminDetails.companyUid || "";
    setAdminCompanyUid(companyUid);
    fetchMachinesByCompanyUid(companyUid);
  }, []);

  const fetchMachinesByCompanyUid = async (companyUid: string) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/machines/${companyUid}`
      );

      const machinesWithValidData = response.data.map((machine: Machine) => ({
        ...machine,
        serviceDate: machine.serviceDate
          .map((d) => new Date(d).toISOString()) // Ensure ISO format
          .filter((d) => !isNaN(new Date(d).getTime())), // Filter invalid dates
        usageTime: machine.usageTime
          .map((ut) => ({
            time: Number(ut.time) || 0,
            date: new Date(ut.date),
          }))
          .filter((ut) => !isNaN(ut.time)),
      }));

      const machinesWithPredictions = await Promise.all(
        machinesWithValidData.map(async (machine: Machine) => ({
          ...machine,
          predictedServiceDate: await getPrediction(machine, companyUid),
        }))
      );

      setMachines(machinesWithPredictions);
      setFilteredMachines(machinesWithPredictions); // Initialize filteredMachines
    } catch (error: any) {
      message.error("Failed to fetch machines", error.messasge);
    }
  };

  const getPrediction = async (machine: Machine, companyUid: string) => {
    try {
      const response = await axios.post(
        "http://localhost:5000/predict-service",
        {
          companyUid: companyUid,
          machineUid: machine._id, // Pass machine UID for prediction
        }
      );

      // Handle date formatting consistently
      return response.data.predicted_service_date
        ? moment(response.data.predicted_service_date).toISOString()
        : null;
    } catch (error) {
      console.error("Prediction error:", error);
      return null;
    }
  };

  // Real-time filter function
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = machines.filter((machine) =>
      machine.name.toLowerCase().includes(query)
    );
    setFilteredMachines(filtered);
  };

  const showModal = (machine: Machine | null) => {
    setIsModalVisible(true);
    const initialDates =
      machine?.serviceDate
        ?.map((d) => moment(d))
        ?.filter((d) => d.isValid()) || [];

    const lastUsage = machine?.usageTime?.slice(-1)[0]?.time;
    const initialUsage = lastUsage?.toString() || "0";

    setSelectedDates(initialDates);
    form.setFieldsValue({
      name: machine?.name || "",
      usageTime: initialUsage,
      serviceDate: initialDates,
    });
    setEditingMachine(machine);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedDates([]);
  };

  const handleDateChange = (date: Moment | null) => {
    if (date?.isValid()) {
      const newDates = [...selectedDates, date];
      setSelectedDates(newDates);
      form.setFieldsValue({ serviceDate: newDates });
    }
  };

  const removeDate = (index: number) => {
    const newDates = selectedDates.filter((_, i) => i !== index);
    setSelectedDates(newDates);
    form.setFieldsValue({ serviceDate: newDates });
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const parsedUsageTime = parseFloat(values.usageTime);

      if (isNaN(parsedUsageTime)) {
        throw new Error("Please enter a valid number for usage time");
      }

      const validDates = selectedDates
        .filter((m) => m.isValid())
        .map((m) => m.toISOString().split("T")[0]);

      const machineData = {
        name: values.name,
        serviceDate: validDates,
        companyUid: adminCompanyUid,
        usageTime: [
          ...(editingMachine?.usageTime || []),
          { time: parsedUsageTime, date: new Date().toISOString() },
        ],
      };

      if (editingMachine) {
        await axios.put(
          `http://localhost:3000/api/machines/${editingMachine._id}`,
          machineData
        );
      } else {
        await axios.post("http://localhost:3000/api/machines", machineData);
      }

      fetchMachinesByCompanyUid(adminCompanyUid);
      handleCancel();
    } catch (error: any) {
      message.error(error.message || "Failed to save machine");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/machines/${id}`);
      fetchMachinesByCompanyUid(adminCompanyUid);
      message.success("Machine deleted successfully!");
    } catch (error: any) {
      message.error("Failed to delete machine", error.message);
    }
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text: string, record: Machine) => (
        <Button type="link" onClick={() => setSelectedMachine(record)}>
          {text}
        </Button>
      ),
    },
    {
      title: "Current Usage (hours)",
      dataIndex: "usageTime",
      render: (usageTime: { time: number }[]) => (
        <Tag color="blue">{usageTime.slice(-1)[0]?.time || 0}</Tag>
      ),
    },
    {
      title: "Service History",
      dataIndex: "serviceDate",
      render: (dates: string[]) =>
        dates.map((date) => moment(date).format("YYYY-MM-DD")).join(", "),
    },
    {
      title: "Predicted Service",
      dataIndex: "predictedServiceDate",
      render: (date: string) =>
        date ? moment(date).format("YYYY-MM-DD HH:mm") : "N/A",
    },
    {
      title: "Actions",
      render: (record: Machine) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => showModal(record)} />
          <Button
          type="primary"
          variant="filled"
          color="danger"
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record._id)}
          />
        </Space>
      ),
    },
  ];

  return (
    <Card title="Machines Management">
      {/* Real-time Filter Input */}
      <Input
        placeholder="Filter by machine name"
        value={searchQuery}
        onChange={handleFilterChange}
        style={{ marginBottom: 16 }}
      />

      <Button
        type="primary"
        variant="filled"
        color="primary"
        onClick={() => showModal(null)}
        style={{ marginBottom: 16 }}
      >
        Add Machine
      </Button>
      <Table
        dataSource={filteredMachines} // Use filteredMachines instead of machines
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 4 }}
      />
      <Modal
        title={`${editingMachine ? "Edit" : "Add"} Machine`}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        destroyOnClose
        style={{ height: "fit-content" }}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Machine Name"
            name="name"
            rules={[{ required: true, message: "Machine name is required" }]}
          >
            <Input placeholder="Enter machine name" />
          </Form.Item>

          <Form.Item
            label={editingMachine ? "Add Usage Hours" : "Initial Usage Hours"}
            name="usageTime"
          >
            <Input
              placeholder="Enter usage time in hours"
              addonAfter="hours"
              type="number"
            />
          </Form.Item>

          <Form.Item
            label={editingMachine ? "Service Dates" : "Initial Service Dates"}
            name="serviceDate"
          >
            <Space direction="vertical">
              <DatePicker
                format="YYYY-MM-DD"
                placeholder="Select service date"
                disabledDate={(current) =>
                  current && current < moment().endOf("day")
                }
                onChange={handleDateChange}
              />
              <div className="w-full flex flex-wrap">
                {selectedDates.map((date, index) => (
                  <Tag
                    key={index}
                    closable
                    onClose={() => removeDate(index)}
                    style={{ marginBottom: 4 }}
                  >
                    {date.format("YYYY-MM-DD")}
                  </Tag>
                ))}
              </div>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`Usage History - ${selectedMachine?.name || "N/A"}`}
        visible={!!selectedMachine}
        onCancel={() => setSelectedMachine(null)}
        footer={null}
        width={800}
      >
        <LineChart
          width={700}
          height={300}
          data={selectedMachine?.usageTime.map((ut) => ({
            date: moment(ut.date).format("MMM D"),
            Usage: ut.time,
          }))}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Line
            type="monotone"
            dataKey="Usage"
            stroke="#1890ff"
            strokeWidth={2}
          />
        </LineChart>
        <Text strong>Last Predicted Service:</Text>
        <Text style={{ marginLeft: 8 }}>
          {selectedMachine?.predictedServiceDate
            ? moment(selectedMachine.predictedServiceDate).format("LL")
            : "No prediction available"}
        </Text>
      </Modal>
    </Card>
  );
};

export default SandM;