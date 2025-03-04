import { Button, Menu } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeOutlined,
  TeamOutlined,
  SettingOutlined,
  UserOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";

export default function NavBar() {
  const location = useLocation();
  const selectedKey = location.pathname;

  return (
    <nav className="p-4 w-[20vw] h-[100dvh] bg-[#f5f3f4] flex flex-col justify-around">
      <div className="text-3xl text-center">Lathe Logic</div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        style={{ width: "100%", backgroundColor: "#f5f3f4" }}
      >
        <Menu.Item key="/" icon={<HomeOutlined />}>
          <NavLink to="/">Dashboard</NavLink>
        </Menu.Item>
        <Menu.Item key="/kanban" icon={<AreaChartOutlined />}>
          <NavLink to="/kanban">Kanban</NavLink>
        </Menu.Item>
        <Menu.Item key="/employees" icon={<TeamOutlined />}>
          <NavLink to="/employees">Employees</NavLink>
        </Menu.Item>
        <Menu.Item key="/sm" icon={<SettingOutlined />}>
          <NavLink to="/sm">Service and Maintenance</NavLink>
        </Menu.Item>
        <Menu.Item key="/profile" icon={<UserOutlined />}>
          <NavLink to="/profile">Account</NavLink>
        </Menu.Item>
      </Menu>
      <Button
        type="primary"
        danger
        style={{ width: "fit-content", alignSelf: "center" }}
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = '/';
        }}
      >
        Logout
      </Button>
    </nav>
  );
}
