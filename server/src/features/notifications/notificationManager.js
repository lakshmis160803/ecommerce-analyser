const clients = new Map(); 

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
export const sendToUser = (userId, data, event = "notification") => {
  const id = String(userId);
  const set = clients.get(id);

  if (!set || set.size === 0) return;

  const payload = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

  for (const res of set) {
    res.write(payload);
  }
};
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