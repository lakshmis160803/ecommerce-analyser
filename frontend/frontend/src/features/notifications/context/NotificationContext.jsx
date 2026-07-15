import { createContext, useContext, useEffect, useState } from "react";

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource(
      `${import.meta.env.VITE_API_URL || ""}/api/notifications/stream`,
      { withCredentials: true }
    );

    source.addEventListener("connected", () => {
      console.log("SSE connected");
      setConnected(true);
    });

    source.addEventListener("stock-alert", (event) => {
      const data = JSON.parse(event.data);
      console.log("stock-alert received:", data);
      setNotifications((prev) => [data, ...prev]);
    });

    source.onerror = (err) => {
      console.error("SSE error:", err);
      setConnected(false);
    };

    return () => {
      source.close();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, connected }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error("useNotifications must be used inside <NotificationProvider>");
  }
  return ctx;
}