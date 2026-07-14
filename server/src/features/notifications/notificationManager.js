// In-memory registry of open SSE connections, keyed by userId.
// Works fine for a single Node process. If you ever run multiple instances
// behind a load balancer, you'd need to swap this for Redis pub/sub so
// notifications reach a client regardless of which instance holds their
// connection.

const clients = new Map(); // userId (string) -> Set of res objects

export const addClient = (userId, res) => {
  const id = String(userId);

  if (!clients.has(id)) {
    clients.set(id, new Set());
  }

  clients.get(id).add(res);
};

export const removeClient = (userId, res) => {
  const id = String(userId);
  const set = clients.get(id);

  if (!set) return;

  set.delete(res);

  if (set.size === 0) {
    clients.delete(id);
  }
};

// Send an event to every open connection for a specific user.
// `event` is optional (defaults to the generic "message" event on the client).
export const sendToUser = (userId, data, event = "notification") => {
  const id = String(userId);
  const set = clients.get(id);

  if (!set || set.size === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const res of set) {
    res.write(payload);
  }
};

// Broadcast to every connected user, regardless of who they are.
// Useful for system-wide announcements (maintenance, etc).
export const broadcast = (data, event = "notification") => {
  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const set of clients.values()) {
    for (const res of set) {
      res.write(payload);
    }
  }
};

export const getConnectedCount = () => {
  let total = 0;
  for (const set of clients.values()) total += set.size;
  return total;
};