import axiosInstance from "../../../api/axiosInstance";

// LOGIN
export const loginUser = (data) => {
  return axiosInstance.post(
    "/auth/login",
    data
  );
};

// REGISTER
export const registerUser = (data) => {
  return axiosInstance.post(
    "/auth/register",
    data
  );
};

// CURRENT USER
export const getMe = () => {
  return axiosInstance.get(
    "/auth/me"
  );
};

// LOGOUT
export const logoutUser = () => {
  return axiosInstance.post(
    "/auth/logout"
  );
};