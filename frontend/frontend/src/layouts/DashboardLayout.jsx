import { Outlet } from "react-router-dom";
import Sidebar from "./sidebarLayout";


const DashboardLayout = () => {
  return (
<div className="flex flex-col lg:flex-row">
  <Sidebar />
  <main className="flex-1 pt-20 lg:pt-8 p-4 md:p-8 lg:pl-8"> 
    <Outlet />
  </main>
</div>
  );
};

export default DashboardLayout;