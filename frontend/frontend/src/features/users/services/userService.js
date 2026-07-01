import axiosInstance from "../../../api/axiosInstance";

export const getUsers = () => {
  return axiosInstance.get("/users");
};

export const updateRole = (id, role) => {
  return axiosInstance.patch(
    `/users/${id}/role`,
    {
      role,
    }
  );
};
export const createAdmin = (data) =>
  axiosInstance.post("/users/create-admin", data);
