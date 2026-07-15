import axiosInstance from "../../../api/axiosInstance";

export const loginUser = (data) => {
  return axiosInstance.post("/auth/login", data);
};

export const registerUser = (data) => {
  return axiosInstance.post("/auth/register", data);
};

export const getMe = () => {
  return axiosInstance.get("/auth/me");
};

export const logoutUser = () => {
  return axiosInstance.post("/auth/logout");
};

export const forgotPasswordRequest = (data) => {
  return axiosInstance.post("/auth/forgot-password", data);
};

export const resetPasswordRequest = (token, data) => {
  return axiosInstance.post(`/auth/reset-password/${token}`, data);
};

export const googleAuthRequest = (data) => {
  return axiosInstance.post("/auth/google", data);
};