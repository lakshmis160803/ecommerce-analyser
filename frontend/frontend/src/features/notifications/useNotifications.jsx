import { useEffect, useState } from "react";

// Simple React hook that opens the SSE stream and collects incoming
// notifications. Assumes your app already sends an auth cookie/session
// on requests to the same origin — EventSource doesn't support custom
// headers, so if you're using bearer tokens instead of cookies, you'll
// need to pass the token as a query param and validate it in your auth
// middleware for this route specifically.
export default function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const source = new EventSource("/api/notifications/stream", {
      withCredentials: true,
    });

    source.addEventListener("connected", () => setConnected(true));

    source.addEventListener("stock-alert", (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => [data, ...prev]);
    });

    source.onerror = () => {
      // EventSource auto-reconnects on its own after a network drop,
      // so you usually don't need to manually reconnect here.
      setConnected(false);
    };

    return () => {
      source.close();
    };
  }, []);

  return { notifications, connected };
}

// --- Usage in a component ---
//
// function NotificationBell() {
//   const { notifications, connected } = useNotifications();
//   return (
//     <div>
//       <span>{connected ? "🟢 Live" : "🔴 Reconnecting..."}</span>
//       {notifications.map((n, i) => (
//         <div key={i}>{n.message}</div>
//       ))}
//     </div>
//   );
// }