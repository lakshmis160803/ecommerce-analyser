import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource(`${API_URL}/notifications/stream`, {
      withCredentials: true,
    });

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

  return { notifications, connected };
}