import React, { useState, useEffect } from "react";
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Badge,
  Descriptions,
  Select,
} from "antd";
import { EditOutlined, DeleteOutlined, BellOutlined } from "@ant-design/icons";
import { v4 as uuidv4 } from "uuid"; // Import UUID library
import axios from "axios";

interface Employee {
  _id: string;
  username: string;
  email: string;
  password: string;
  companyUid: string;
  company: string;
  role: string;
  isAdmin: boolean;
  hasNotification: boolean;
  leaveRequest?: string; // Optional leave request details
}

const Employees: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]); // For filtered results
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [form] = Form.useForm();
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [leaveRequestModalVisible, setLeaveRequestModalVisible] =
    useState<boolean>(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(
    null
  );
  const [adminCompanyUid, setAdminCompanyUid] = useState<string>("");
  const [adminCompany, setAdminCompany] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

  useEffect(() => {
    // Fetch admin details from sessionStorage or any other storage
    const adminDetails = JSON.parse(sessionStorage.getItem("user") || "{}");
    setAdminCompanyUid(adminDetails.companyUid || "");
    setAdminCompany(adminDetails.company || "");

    // Fetch employees by companyUid
    fetchEmployeesByCompanyUid(adminDetails.companyUid);
  }, []);

  const fetchEmployeesByCompanyUid = async (companyUid: string) => {
    if (!companyUid) return;

    try {
      const response = await axios.get(
        `http://localhost:3000/api/company/employees/${companyUid}`
      );
      setEmployees(response.data);
      setFilteredEmployees(response.data); // Initialize filteredEmployees
    } catch (error) {
      message.error("Failed to fetch employees");
    }
  };

  // Real-time filter function
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = employees.filter(
      (employee) =>
        employee.username.toLowerCase().includes(query) ||
        employee.email.toLowerCase().includes(query) ||
        employee.role.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  };

  const showModal = (employee: Employee | null = null) => {
    setEditingEmployee(employee);
    form.setFieldsValue({
      ...(employee || {}),
      companyUid: adminCompanyUid,
      company: adminCompany,
    });
    setIsModalVisible(true);
  };

  const handleOk = async () => {
    form.validateFields().then(async (values: Partial<Employee>) => {
      try {
        if (editingEmployee) {
          // Update existing employee
          const updatedEmployee: Employee = {
            ...editingEmployee,
            ...values,
            companyUid: adminCompanyUid,
            company: adminCompany,
          };
          await axios.put(
            `http://localhost:3000/api/company/employees/${editingEmployee._id}`,
            updatedEmployee
          );
          message.success("Employee updated successfully!");
        } else {
          // Add new employee
          const newEmployee: Employee = {
            _id: uuidv4(),
            ...values,
            companyUid: adminCompanyUid,
            company: adminCompany,
            isAdmin: false,
          } as Employee;
          await axios.post(
            "http://localhost:3000/api/admin/add-user",
            newEmployee
          );
          message.success("Employee added successfully!");
        }
        // Fetch employees again to refresh the list
        fetchEmployeesByCompanyUid(adminCompanyUid);
        setIsModalVisible(false);
        form.resetFields();
      } catch (error) {
        message.error("Failed to save employee");
      }
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/company/employees/${id}`);
      // Fetch employees again to refresh the list
      fetchEmployeesByCompanyUid(adminCompanyUid);
      message.success("Employee deleted successfully!");
    } catch (error) {
      message.error("Failed to delete employee");
    }
  };

  const handleViewRequest = (record: Employee) => {
    message.info(`Viewing request for ${record.username}`);
    // Implement view request logic here
  };

  const handleApprove = (record: Employee) => {
    message.success(`Approved leave request for ${record.username}`);
    // Implement approval logic here
    // Remove notification after approval
    const updatedEmployees = employees.map((emp) =>
      emp._id === record._id
        ? { ...emp, hasNotification: false, leaveRequest: undefined }
        : emp
    );
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees); // Update filteredEmployees
    setLeaveRequestModalVisible(false);
  };

  const handleReject = (record: Employee) => {
    message.error(`Rejected leave request for ${record.username}`);
    // Implement rejection logic here
    // Remove notification after rejection
    const updatedEmployees = employees.map((emp) =>
      emp._id === record._id
        ? { ...emp, hasNotification: false, leaveRequest: undefined }
        : emp
    );
    setEmployees(updatedEmployees);
    setFilteredEmployees(updatedEmployees); // Update filteredEmployees
    setLeaveRequestModalVisible(false);
  };

  const handleOpenLeaveRequestModal = (record: Employee) => {
    setSelectedEmployee(record);
    setLeaveRequestModalVisible(true);
  };

  const handleCloseLeaveRequestModal = () => {
    setLeaveRequestModalVisible(false);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
    },
    {
      title: "Company",
      dataIndex: "company",
      key: "company",
    },
    {
      title: "Actions",
      key: "actions",
      render: (record: Employee) => (
        <>
          <Button type="link" onClick={() => showModal(record)}>
            <EditOutlined />
          </Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>
            <DeleteOutlined />
          </Button>
        </>
      ),
    },
    {
      title: "Leave Request",
      key: "emp_actions",
      render: (record: Employee) => (
        <div className="flex gap-2">
          <Badge dot={record.hasNotification}>
            <Button onClick={() => handleOpenLeaveRequestModal(record)}>
              <BellOutlined />
            </Button>
          </Badge>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Real-time Filter Input */}
      <Input
        placeholder="Filter by username, email, or role"
        value={searchQuery}
        onChange={handleFilterChange}
        style={{ marginBottom: 16 }}
      />

      <Button
        type="primary"
        variant="filled"
        color="primary"
        onClick={() => showModal()}
        style={{ marginBottom: 16 }}
      >
        Add Employee
      </Button>
      <Table columns={columns} dataSource={filteredEmployees} rowKey="_id" />
      <Modal
        title={`${editingEmployee ? "Edit" : "Add"} Employee`}
        visible={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="username"
            label="Username"
            rules={[{ required: true, message: "Please enter the username" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, message: "Please enter the email" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Please enter the password" }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: "Please select the role" }]}
          >
            <Select>
              <Select.Option value="operator">Operator</Select.Option>
              <Select.Option value="technician">Technician</Select.Option>
              <Select.Option value="apprentice">Apprentice</Select.Option>
              <Select.Option value="admin">Admin</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title="Leave Request"
        visible={leaveRequestModalVisible}
        onCancel={handleCloseLeaveRequestModal}
        footer={[
          <Button
            key="reject"
            type="primary"
            danger
            onClick={() => selectedEmployee && handleReject(selectedEmployee)}
          >
            Reject
          </Button>,
          <Button
            key="approve"
            type="primary"
            onClick={() => selectedEmployee && handleApprove(selectedEmployee)}
          >
            Approve
          </Button>,
        ]}
        width={600} // Adjust width as needed
      >
        {selectedEmployee && (
          <Descriptions
            title={`Leave Request for ${selectedEmployee.username}`}
            bordered
            column={1}
          >
            <Descriptions.Item label="Employee ID">
              {selectedEmployee._id}
            </Descriptions.Item>
            <Descriptions.Item label="Username">
              {selectedEmployee.username}
            </Descriptions.Item>
            <Descriptions.Item label="Position">
              {selectedEmployee.role}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedEmployee.email}
            </Descriptions.Item>
            <Descriptions.Item label="Leave Request">
              {selectedEmployee.leaveRequest || "No leave request available"}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default Employees;
