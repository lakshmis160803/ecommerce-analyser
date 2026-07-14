import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axiosInstance from "../api/axiosInstance";
import { logout } from "../features/auth/store/authSlice";

const Sidebar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Responsive State Tracker for the Hamburger toggle
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      
      <div className="lg:hidden fixed top-0 left-0 w-full bg-white h-16 px-6 border-b border-gray-100 flex items-center justify-between z-40 shadow-sm">
        <h2 className="text-xl font-bold text-violet-600">
          Ecom Intelligence
        </h2>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg hover:bg-violet-50 text-gray-700 focus:outline-none"
          aria-label="Open Menu"
        >
          {/* Simple Clean Hamburger Menu SVG */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/40 z-50 transition-opacity"
        />
      )}

      {/* 3. Original Sidebar with dynamic placement utilities applied */}
      <aside className={`
        fixed top-0 left-0 h-screen w-72 bg-white shadow-lg p-6 flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0
      `}>

        {/* Close Button Inside Sidebar for Mobile screens */}
        <div className="lg:hidden absolute top-5 right-5">
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100"
            aria-label="Close Menu"
          >
            {/* Simple Clean X Close SVG */}
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-violet-600 mb-8">
            Ecom Intelligence
          </h2>

          <nav className="space-y-3">
            <NavLink
              to="/dashboard"
              onClick={() => setIsOpen(false)} // Auto-closes sidebar when link is clicked
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
              onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `block p-3 rounded-lg ${isActive
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
          <div className="mt-auto pt-6">
            <button
              onClick={handleLogout}
              className="w-full py-3 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
            >
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* 4. Desktop Spacer Helper */}
      {/* Ensures page layout wraps/shifts cleanly to the right side of the sidebar */}
      <div className="hidden lg:block w-72 flex-shrink-0" />
    </>
  );
};

export default Sidebar;