export const getDashboard = () =>
  axiosInstance.get("/customers/dashboard");

export const getTopCustomers = () =>
  axiosInstance.get("/customers/top-customers");

export const getSegments = () =>
  axiosInstance.get("/customers/segments");

export const getGrowth = () =>
  axiosInstance.get("/customers/growth");

export const getAllCustomers = () =>
  axiosInstance.get("/customers/all-customers");