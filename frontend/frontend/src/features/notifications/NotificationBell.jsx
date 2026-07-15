import { useState } from "react";

const NotificationBell = ({ notifications, connected }) => {
  const [open, setOpen] = useState(false);
  const unreadCount = notifications.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100"
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
        {!connected && (
          <span
            className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-gray-400"
            title="Reconnecting..."
          />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border max-h-96 overflow-y-auto z-50">
          {notifications.length === 0 ? (
            <div className="p-4 text-sm text-gray-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((n, i) => (
              <div key={i} className="p-3 border-b text-sm last:border-none">
                <p className="font-medium">
                  {n.type === "OUT_OF_STOCK" ? "⚠️ Out of stock" : "📉 Low stock"}
                </p>
                <p className="text-gray-600">{n.message}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;