import { Route, Routes } from "react-router-dom";
import NavBar from "./components/NavBar";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import Profile from "./pages/Profile";
import SandM from "./pages/SandM";
import Kanban from "./pages/Kanban";
import Login from "./pages/Login";

const App = () => {
  const isUserAuthenticated = localStorage.getItem('token')
  return (
    <>
      <div className="flex h-[100vh]">
        {isUserAuthenticated && <NavBar />}
        <div className="flex-1 p-4 overflow-auto bg-[#fff]">
          <Routes>
            <Route
              path="/"
              element={isUserAuthenticated ? <Dashboard /> : <Login />}
            />
            <Route path="/employees" element={<Employees />} />
            <Route path="/sm" element={<SandM />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/kanban" element={<Kanban />} />
          </Routes>
        </div>
      </div>
    </>
  );
};

export default App;
