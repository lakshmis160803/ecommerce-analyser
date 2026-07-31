import { Outlet } from "react-router-dom";
import Sidebar from "./sidebarLayout";
import useNotifications from "../features/notifications/useNotifications";
import NotificationBell from "../features/notifications/NotificationBell";
import ChatBot from "../features/chatbot/components/chatbot.jsx";

const DashboardLayout = () => {
  const { notifications, connected } = useNotifications();

  return (
    <div className="flex flex-col lg:flex-row">
      <Sidebar />

      <main className="flex-1 pt-20 lg:pt-8 p-4 md:p-8 lg:pl-8">
        <div className="flex justify-end mb-4">
          <NotificationBell
            notifications={notifications}
            connected={connected}
          />
        </div>

        <Outlet />
      </main>

      {/* Floating AI Chatbot */}
      <ChatBot />
    </div>
  );
};

export default DashboardLayout;