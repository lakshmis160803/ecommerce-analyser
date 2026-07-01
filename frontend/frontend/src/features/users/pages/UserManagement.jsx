import { useEffect, useState } from "react";
import {
  getUsers,
  updateRole,
  createAdmin,
} from "../services/userService";
const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [adminData, setAdminData] = useState({
        name: "",
        email: "",
        password: "",
    });

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await getUsers();
            setUsers(res.data.users);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleRoleChange = async (userId, role) => {
        try {
            await updateRole(userId, role);
            fetchUsers();
        } catch (error) {
            console.log(error);
        }
    };

    const roleColor = (role) => {
        switch (role) {
            case "superadmin":
                return "bg-red-100 text-red-600";
            case "admin":
                return "bg-violet-100 text-violet-700";
            default:
                return "bg-emerald-100 text-emerald-700";
        }
    };
const handleCreateAdmin = async (e) => {
  e.preventDefault();

  try {
    await createAdmin(adminData);

    alert("Admin created successfully");

    setAdminData({
      name: "",
      email: "",
      password: "",
    });

    setShowModal(false);

    fetchUsers();
  } catch (error) {
    console.log(error);

    alert(
      error.response?.data?.message ||
      "Failed to create admin"
    );
  }
};
    return (
        <div className="min-h-screen bg-slate-100 p-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-3xl p-8 text-white shadow-xl mb-8">

  <div className="flex justify-between items-center">

    <div>

      <h1 className="text-4xl font-bold">
        User Management
      </h1>

      <p className="mt-2 text-violet-100">
        Manage user roles and permissions across the platform.
      </p>

      <div className="mt-6 inline-flex items-center bg-white/20 px-4 py-2 rounded-full">
        Total Users : {users.length}
      </div>

    </div>

    <button
      onClick={() => setShowModal(true)}
      className="bg-white text-violet-700 px-6 py-3 rounded-xl font-semibold hover:bg-violet-100"
    >
      + Create Admin
    </button>

  </div>

</div>

            {/* Table */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden">

                <div className="px-8 py-5 border-b">
                    <h2 className="text-2xl font-semibold">
                        Registered Users
                    </h2>
                </div>

                {loading ? (
                    <div className="p-10 text-center text-gray-500">
                        Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-10 text-center text-gray-500">
                        No users found.
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr className="text-left text-gray-600 uppercase text-sm">
                                <th className="px-8 py-4">User</th>
                                <th>Email</th>
                                <th>Current Role</th>
                                <th>Assign Role</th>
                            </tr>
                        </thead>

                        <tbody>
                            {users.map((user) => (
                                <tr
                                    key={user._id}
                                    className="border-t hover:bg-violet-50 transition"
                                >
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-violet-600 text-white flex items-center justify-center font-bold text-lg">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>

                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {user.name}
                                                </p>

                                                <p className="text-sm text-gray-500">
                                                    ID: {user._id.slice(-6)}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="text-gray-600">
                                        {user.email}
                                    </td>

                                    <td>
                                        <span
                                            className={`px-4 py-2 rounded-full text-sm font-semibold capitalize ${roleColor(
                                                user.role
                                            )}`}
                                        >
                                            {user.role}
                                        </span>
                                    </td>

                                    <td>
                                        <select
                                            value={user.role}
                                            onChange={(e) =>
                                                handleRoleChange(
                                                    user._id,
                                                    e.target.value
                                                )
                                            }
                                            className="border rounded-xl px-4 py-2 focus:ring-2 focus:ring-violet-500 outline-none"
                                        >
                                            <option value="viewer">
                                                Viewer
                                            </option>

                                            <option value="admin">
                                                Admin
                                            </option>


                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
            {showModal && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl p-8 w-[450px]">

      <h2 className="text-2xl font-bold mb-6">
        Create Admin
      </h2>

      <form
        onSubmit={handleCreateAdmin}
        className="space-y-5"
      >

        <input
          type="text"
          placeholder="Name"
          value={adminData.name}
          onChange={(e) =>
            setAdminData({
              ...adminData,
              name: e.target.value,
            })
          }
          className="w-full border rounded-lg p-3"
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={adminData.email}
          onChange={(e) =>
            setAdminData({
              ...adminData,
              email: e.target.value,
            })
          }
          className="w-full border rounded-lg p-3"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={adminData.password}
          onChange={(e) =>
            setAdminData({
              ...adminData,
              password: e.target.value,
            })
          }
          className="w-full border rounded-lg p-3"
          required
        />

        <div className="flex justify-end gap-3">

          <button
            type="button"
            onClick={() => setShowModal(false)}
            className="px-5 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2 rounded-lg"
          >
            Create Admin
          </button>

        </div>

      </form>

    </div>

  </div>
)}
        </div>
    );
};

export default UserManagement;