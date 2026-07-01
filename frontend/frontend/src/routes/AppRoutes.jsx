import { Routes, Route } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Dashboard from "../features/dashboard/Dashboard";
import SignUp from "../features/auth/pages/Signup";
import UploadData from "../features/imports/pages/UploadData";
import ProtectedRoute from "./ProtectedRoute";
import ProductAnalysis from "../features/analytics/pages/ProductAnalysis";
import OrderAnalytics from "../features/analytics/pages/orderAnalytics";
import DashboardLayout from "../layouts/DashboardLayout";
import UserManagement from "../features/users/pages/UserManagement";
import CustomerAnalysis from "../features/analytics/pages/CustomerAnalysis";
const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={<Login />} />

      <Route
        path="/signup"
        element={<SignUp />}
      />

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        <Route
          path="/upload"
          element={<UploadData />}
        />

        <Route
          path="/products"
          element={<ProductAnalysis />}
        />

        <Route
          path="/orders"
          element={<OrderAnalytics />}
        />

        <Route
          element={<UserManagement />}
          path="/users"
        />

      <Route
  path="/customers"
  element={<CustomerAnalysis />}
/>
      </Route>
    </Routes>
  );
};

export default AppRoutes;