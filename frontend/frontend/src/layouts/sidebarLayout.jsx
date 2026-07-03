import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import { logout } from "../features/auth/store/authSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
const { user } = useSelector((state) => state.auth);
  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
    } catch (err) {
      console.log(err);
    } finally {
      dispatch(logout());

      localStorage.clear();
      sessionStorage.clear();

      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="fixed top-0 left-0 h-screen w-72 bg-white shadow-lg p-6 flex flex-col z-50">

      <div>
        <h2 className="text-2xl font-bold text-violet-600 mb-8">
          Ecom Intelligence
        </h2>

        <nav className="space-y-3">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `block p-3 rounded-lg ${isActive
                ? "bg-violet-600 text-white"
                : "hover:bg-violet-100"
              }`
            }
          >
            Dashboard
          </NavLink>

          <NavLink
            to="/upload"
            className={({ isActive }) =>
              `block p-3 rounded-lg ${isActive
                ? "bg-violet-600 text-white"
                : "hover:bg-violet-100"
              }`
            }
          >
            Upload Data
          </NavLink>

          <NavLink
            to="/products"
            className={({ isActive }) =>
              `block p-3 rounded-lg ${isActive
                ? "bg-violet-600 text-white"
                : "hover:bg-violet-100"
              }`
            }
          >
            Product Analysis
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              `block p-3 rounded-lg ${isActive
                ? "bg-violet-600 text-white"
                : "hover:bg-violet-100"
              }`
            }
          >
            Order Analysis
          </NavLink>

          <NavLink
            to="/customers"
            className={({ isActive }) =>
              `block p-3 rounded-lg ${isActive
                ? "bg-violet-600 text-white"
                : "hover:bg-violet-100"
              }`
            }
          >
            Customer Analysis
          </NavLink>

          <NavLink
            to="/regional"
            className={({ isActive }) =>
              `block p-3 rounded-lg ${isActive
                ? "bg-violet-600 text-white"
                : "hover:bg-violet-100"
              }`
            }
          >
            Regional Analysis
          </NavLink>

          <NavLink
            to="/inventory"
            className={({ isActive }) =>
              `block p-3 rounded-lg ${isActive
                ? "bg-violet-600 text-white"
                : "hover:bg-violet-100"
              }`
            }
          >
            Inventory
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              `block p-3 rounded-lg ${isActive
                ? "bg-violet-600 text-white"
                : "hover:bg-violet-100"
              }`
            }
          >
            Reports
          </NavLink>
          {user?.role === "superadmin" && (
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `block p-3 rounded-lg ${
                  isActive
                    ? "bg-violet-600 text-white"
                    : "hover:bg-violet-100"
                }`
              }
            >
              User Management
            </NavLink>
          )}
 
        </nav>
        {/* Logout Button */}
        <div className="mt-auto pt-6 ">
          <button
            onClick={handleLogout}
            className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
          >
            Logout
          </button>
        </div>

      </div>


    </aside>
  );
};

export default Sidebar;