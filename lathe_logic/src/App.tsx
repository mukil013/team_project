import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Profile from "./pages/Profile";
import SandM from "./pages/SandM";
import Kanban from "./pages/Kanban";
import Login from "./pages/Login";
import EmployeeHome from "./employee/EmployeeHome";
import NavBarEmp from "./components/NavBarEmp";

const App = () => {
  const isUserAuthenticated = localStorage.getItem('token')
  const isAdmin = JSON.parse(sessionStorage.getItem("user")!)

  return (
    <>
      <div className="flex h-[100vh]">
        {isUserAuthenticated && isAdmin.isAdmin && <NavBar />}
        {isUserAuthenticated && !isAdmin.isAdmin && <NavBarEmp />}
        <div className="flex-1 p-4 overflow-auto bg-[#fff]">
          <Routes>
            <Route
              path="/"
              element={isUserAuthenticated ? isAdmin.isAdmin ? <Dashboard /> : <Kanban /> : <Login />}
            />
            <Route path="/employees" element={<Employees />} />
            <Route path="/sm" element={<SandM />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/kanban" element={<Kanban />} />
            <Route path="/employee-home" element={<EmployeeHome />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;
