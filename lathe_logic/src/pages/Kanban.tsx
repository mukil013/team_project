// src/components/Kanban.tsx
import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Card,
  Button,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Modal,
} from "antd";
import axios from "axios";
import moment from "moment";

const { Option } = Select;

interface Task {
  id: string;
  name: string;
  description: string;
  assignedTo: string;
  eta: string;
  companyUid: string;
  priority: "high" | "medium" | "low";
  column: "todo" | "inProgress" | "completed";
}

interface Employee {
  id: string;
  username: string;
  role: string;
}

const initialTasks: Record<string, Task[]> = {
  todo: [],
  inProgress: [],
  completed: [],
};

const Kanban: React.FC = () => {
  const [tasks, setTasks] = useState(initialTasks);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch tasks from the backend
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const companyData = JSON.parse(sessionStorage.getItem("user") || "{}");
        if (!companyData.companyUid) {
          message.error("No company UID found.");
          return;
        }

        const response = await axios.get(
          `http://localhost:3000/api/tasks/${companyData.companyUid}`
        );
        console.log("Fetched tasks:", response.data);

        // Organize tasks into columns
        const organizedTasks = response.data.reduce(
          (acc: Record<string, Task[]>, task: Task) => {
            acc[task.column].push(task);
            return acc;
          },
          { todo: [], inProgress: [], completed: [] }
        );

        setTasks(organizedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
        message.error("Failed to fetch tasks");
      }
    };

    fetchTasks();
  }, []);

  // Fetch employees from the backend
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const companyData = JSON.parse(sessionStorage.getItem("user") || "{}");
        if (!companyData.companyUid) {
          message.error("No company UID found.");
          return;
        }

        const response = await axios.get(
          `http://localhost:3000/api/company/employees/${companyData.companyUid}`
        );
        console.log("Fetched employees:", response.data);
        setEmployees(response.data);
      } catch (error) {
        console.error("Error fetching employees:", error);
        message.error("Failed to fetch employees");
      }
    };

    fetchEmployees();
  }, []);

  const userData = JSON.parse(sessionStorage.getItem("user") || "{}");

  // Add a new task
  const addTask = async (values: Omit<Task, "id" | "column">) => {
    const newTask: Task = {
      id: `TASK-${Date.now()}`, // Auto-generate Task ID
      ...values,
      companyUid: userData.companyUid,
      eta: moment(values.eta).format("YYYY-MM-DD HH:mm"), // Convert ETA to string
      column: selectedColumn as Task["column"],
    };

    try {
      const companyData = JSON.parse(sessionStorage.getItem("user") || "{}");
      if (!companyData.companyUid) {
        message.error("No company UID found.");
        return;
      }

      await axios.post("http://localhost:3000/api/tasks", {
        ...newTask,
        companyUid: companyData.companyUid, // Include companyUid
      });

      setTasks((prevTasks) => ({
        ...prevTasks,
        [selectedColumn]: [...prevTasks[selectedColumn], newTask],
      }));

      message.success("Task added successfully!");
      setIsFormVisible(false);
      form.resetFields();
    } catch (error) {
      console.error("Error adding task:", error);
      message.error("Failed to add task");
    }
  };

  // Handle drag-and-drop
  const onDragEnd = async (result: any) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColumn = [...tasks[source.droppableId]];
    const destinationColumn = [...tasks[destination.droppableId]];
    const [movedTask] = sourceColumn.splice(source.index, 1);

    if (source.droppableId === destination.droppableId) {
      sourceColumn.splice(destination.index, 0, movedTask);
    } else {
      destinationColumn.splice(destination.index, 0, movedTask);
      movedTask.column = destination.droppableId as Task["column"];
    }

    setTasks({
      ...tasks,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destinationColumn,
    });

    try {
      await axios.put(`http://localhost:3000/api/tasks/${movedTask.id}`, {
        column: movedTask.column,
      });
    } catch (error) {
      console.error("Error updating task position:", error);
      message.error("Failed to update task position");
    }
  };

  // Get border color based on priority
  const getPriorityBorderColor = (priority: "high" | "medium" | "low") => {
    switch (priority) {
      case "high":
        return "#ff4d4f"; // Red
      case "medium":
        return "#faad14"; // Yellow
      case "low":
        return "#52c41a"; // Green
      default:
        return "#000000";
    }
  };

  // Combine all tasks into a single array for filtering
  const getAllTasks = (): Task[] => {
    return Object.values(tasks).flat();
  };

  // Filter tasks based on search query
  useEffect(() => {
    const allTasks = getAllTasks();
    const filtered = allTasks.filter(
      (task) =>
        task.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.assignedTo.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredTasks(filtered);
  }, [searchQuery, tasks]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "20px",
      }}
    >
      {/* Search Bar */}
      <Input
        placeholder="Search by Task ID or Username"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ width: "300px", marginBottom: "20px" }}
      />

      {/* Display Filtered Tasks */}
      {searchQuery && (
        <Card
          title="Search Results"
          style={{ width: "300px", marginBottom: "20px" }}
        >
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                style={{
                  marginTop: "10px",
                  borderColor: getPriorityBorderColor(task.priority),
                  borderWidth: "2px",
                }}
              >
                <p>
                  <strong>{task.name}</strong>
                </p>
                <p>{task.description}</p>
                <p>Assigned To: {task.assignedTo}</p>
                <p>ETA: {task.eta}</p>
                <p>Priority: {task.priority}</p>
              </Card>
            ))
          ) : (
            <p>No tasks found.</p>
          )}
        </Card>
      )}

      {/* Kanban Board */}
      <div style={{ display: "flex", gap: "20px" }}>
        <DragDropContext onDragEnd={onDragEnd}>
          {["todo", "inProgress", "completed"].map((columnId) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <Card
                  title={
                    columnId === "todo"
                      ? "Todo"
                      : columnId === "inProgress"
                      ? "In-Progress"
                      : "Completed"
                  }
                  style={{ width: 300, minHeight: 400 }}
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {tasks[columnId].map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <Card
                          style={{
                            marginTop: "10px",
                            borderColor: getPriorityBorderColor(task.priority),
                            borderWidth: "2px",
                          }}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          ref={provided.innerRef}
                        >
                          <p>
                            <strong>{task.name}</strong>
                          </p>
                          <p>{task.description}</p>
                          <p>Assigned To: {task.assignedTo}</p>
                          <p>ETA: {task.eta}</p>
                          <p>Priority: {task.priority}</p>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  <Button
                    type="dashed"
                    block
                    style={{ marginTop: "10px" }}
                    onClick={() => {
                      setSelectedColumn(columnId);
                      setIsFormVisible(true);
                    }}
                  >
                    Add Task
                  </Button>
                </Card>
              )}
            </Droppable>
          ))}
        </DragDropContext>
      </div>

      {/* Add Task Modal */}
      <Modal
        title="Add Task"
        visible={isFormVisible}
        onCancel={() => setIsFormVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          onFinish={addTask}
          layout="vertical"
          initialValues={{ priority: "medium" }}
        >
          <Form.Item
            label="Task Name"
            name="name"
            rules={[{ required: true, message: "Please enter the task name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Task Description"
            name="description"
            rules={[
              { required: true, message: "Please enter the task description!" },
            ]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item
            label="Assign To"
            name="assignedTo"
            rules={[
              { required: true, message: "Please assign the task to someone!" },
            ]}
          >
            <Select placeholder="Select an employee">
              {employees.map((employee) => (
                <Option key={employee.id} value={employee.username}>
                  {employee.username} ({employee.role})
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            label="ETA"
            name="eta"
            rules={[{ required: true, message: "Please select the ETA!" }]}
          >
            <DatePicker showTime format="YYYY-MM-DD HH:mm" />
          </Form.Item>
          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: "Please select the priority!" }]}
          >
            <Select>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Add Task
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Kanban;
