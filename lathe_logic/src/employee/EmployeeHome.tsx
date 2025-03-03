import React from 'react'
import NavBar from '../components/NavBarEmp'
import { Routes, Route } from 'react-router-dom'
import Kanban from '../pages/Kanban'

export default function EmployeeHome() {
  return (
    <>
    <div className="flex h-[100vh]">
      <NavBar />
        <div className="flex-1 p-4 overflow-auto bg-[#fff]">
          <Routes>
            <Route path="/kanban" element={<Kanban />} />
          </Routes>
        </div>
      </div>
    </>
  )
}
