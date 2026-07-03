import axiosInstance from "../../../api/axiosInstance";

export const loginUser = (data) => {
  return axiosInstance.post(
    "/auth/login",
    data
  );
};


export const registerUser = (data) => {
  return axiosInstance.post(
    "/auth/register",
    data
  );
};


export const getMe = () => {
  return axiosInstance.get(
    "/auth/me"
  );
};


export const logoutUser = () => {
  return axiosInstance.post(
    "/auth/logout"
  );
};