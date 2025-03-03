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
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]); // For filtered results
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState("");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [form] = Form.useForm();
  const [searchQuery, setSearchQuery] = useState(""); // State for search query

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
        setFilteredTasks(response.data); // Initialize filteredTasks
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
  const isAdmin = JSON.parse(sessionStorage.getItem("user")!);

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

  // Function to delete a task
  const deleteTask = async (taskId: string, columnId: string) => {
    try {
      await axios.delete(`http://localhost:3000/api/tasks/${taskId}`);
      message.success("Task deleted successfully!");

      // Remove the task from the state
      setTasks((prevTasks) => ({
        ...prevTasks,
        [columnId]: prevTasks[columnId].filter((task) => task.id !== taskId),
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
      message.error("Failed to delete task");
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

  // Real-time filter function
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);

    const filtered = Object.values(tasks)
      .flat()
      .filter((task) =>
        task.name.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.assignedTo.toLowerCase().includes(query)
      );
    setFilteredTasks(filtered);
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        transition: "1s all ease",
      }}
    >
      {/* Search Bar */}
      <Input
        placeholder="Search tasks by name, description, or assigned person..."
        value={searchQuery}
        onChange={handleFilterChange}
        style={{ width: "100%", marginBottom: "20px" }}
      />

      {/* Display Filtered Tasks */}
      {searchQuery && (
        <div>
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <Card
                key={task.id}
                style={{ marginBottom: "16px", width: "300px" }}
              >
                <h3>{task.name}</h3>
                <p>{task.description}</p>
                <p>Assigned To: {task.assignedTo}</p>
                <p>ETA: {task.eta}</p>
                <p>Priority: {task.priority}</p>
              </Card>
            ))
          ) : (
            <p>No tasks found.</p>
          )}
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex">
        <DragDropContext onDragEnd={onDragEnd}>
          {["todo", "inProgress", "completed"].map((columnId) => (
            <Droppable key={columnId} droppableId={columnId}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    margin: "8px",
                    padding: "8px",
                    border: "1px solid lightgrey",
                    borderRadius: ".5rem",
                    minHeight: "50px",
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <h2>
                    {columnId.charAt(0).toUpperCase() + columnId.slice(1)}
                  </h2>
                  {tasks[columnId].map((task, index) => (
                    <Draggable
                      key={task.id}
                      draggableId={task.id}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            width: "90%",
                            userSelect: "none",
                            padding: "8px",
                            margin: "2rem 0",
                            boxShadow: `0 0 0 2px ${
                              task.priority === "high"
                                ? "#ff4d4f55"
                                : task.priority === "medium"
                                ? "#faad1455"
                                : task.priority === "low"
                                ? "#52c41a55"
                                : "lightgray"
                            }`,
                            color: "#000",
                            borderRadius: "8px",
                            backdropFilter: "blur(8px)",
                            ...provided.draggableProps.style,
                          }}
                        >
                          <h3 className="text-xl font-extrabold">
                            {task.name.toUpperCase()}
                          </h3>
                          <hr />
                          <p className="pt-4">{task.description}</p>
                          <p className="font-bold">
                            Assigned To: {task.assignedTo}
                          </p>
                          <p>ETA: {task.eta}</p>
                          <p>Priority: {task.priority}</p>

                          {/* Delete Button */}
                          {isAdmin.isAdmin && (
                            <Button
                              type="primary"
                              variant="filled"
                              color="danger"
                              onClick={() => deleteTask(task.id, columnId)}
                              style={{ marginTop: "8px" }}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                  {isAdmin.isAdmin && (
                    <Button
                      color="default"
                      variant="dashed"
                      onClick={() => {
                        setSelectedColumn(columnId);
                        setIsFormVisible(true);
                      }}
                      style={{ width: "100%" }}
                    >
                      Add Task
                    </Button>
                  )}
                </div>
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
        <Form form={form} onFinish={addTask}>
          <Form.Item
            label="Task Name"
            name="name"
            rules={[{ required: true, message: "Please input task name!" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label="Description" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            label="Assigned To"
            name="assignedTo"
            rules={[{ required: true, message: "Please select an employee!" }]}
          >
            <Select>
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
            rules={[{ required: true, message: "Please select ETA!" }]}
          >
            <DatePicker showTime />
          </Form.Item>
          <Form.Item
            label="Priority"
            name="priority"
            rules={[{ required: true, message: "Please select priority!" }]}
          >
            <Select>
              <Option value="high">High</Option>
              <Option value="medium">Medium</Option>
              <Option value="low">Low</Option>
            </Select>
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Add Task
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default Kanban;