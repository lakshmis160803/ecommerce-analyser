import { useState, useRef, useEffect } from "react";

const NotificationBell = ({ notifications, connected }) => {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState(new Set());
  const panelRef = useRef(null);
  const unreadCount = notifications.length - readIds.size;

  // Close when clicking outside the panel
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const markAllRead = () => {
    setReadIds(new Set(notifications.map((_, i) => i)));
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    const diff = Date.now() - new Date(timestamp).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Notifications"
      >
        <span className="text-2xl">🔔</span>

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-semibold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}

        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white ${
            connected ? "bg-green-500" : "bg-gray-400"
          }`}
          title={connected ? "Live" : "Reconnecting..."}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-white shadow-2xl rounded-2xl border border-gray-100 max-h-[28rem] overflow-hidden z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Notifications</h3>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  connected
                    ? "bg-green-50 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {connected ? "● Live" : "○ Offline"}
              </span>
              {notifications.length > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-violet-600 hover:text-violet-800 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          {/* List */}
          <div className="overflow-y-auto flex-1">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <span className="text-4xl mb-2">🔕</span>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const isUnread = !readIds.has(i);
                const isOutOfStock = n.type === "OUT_OF_STOCK";

                return (
                  <div
                    key={i}
                    onClick={() =>
                      setReadIds((prev) => new Set(prev).add(i))
                    }
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 last:border-none cursor-pointer transition ${
                      isUnread ? "bg-violet-50/60 hover:bg-violet-50" : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-lg ${
                        isOutOfStock
                          ? "bg-red-100 text-red-600"
                          : "bg-orange-100 text-orange-600"
                      }`}
                    >
                      {isOutOfStock ? "⛔" : "📉"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {isOutOfStock ? "Out of stock" : "Low stock"}
                        </p>
                        {isUnread && (
                          <span className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-0.5">
                        {n.message}
                      </p>
                      {n.timestamp && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(n.timestamp)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;