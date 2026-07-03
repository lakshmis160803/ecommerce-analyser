import { Outlet } from "react-router-dom";
import Sidebar from "./sidebarLayout";


const DashboardLayout = () => {
  return (
  <div className="bg-gray-100 min-h-screen">
  <Sidebar />

  <main className="ml-72 p-6">
    <Outlet />
  </main>
</div>
  );
};

export default DashboardLayout;