import { Routes, Route } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Dashboard from "../features/dashboard/Dashboard";
import SignUp from "../features/auth/pages/Signup";
import UploadData from "../features/imports/pages/UploadData";
import ProtectedRoute from "./ProtectedRoute";
import ProductAnalysis from "../features/analytics/pages/ProductAnalysis";
import OrderAnalytics from "../features/analytics/pages/orderAnalytics";
import DashboardLayout from "../layouts/DashboardLayout";
// import DashboardLayout from "../layout/DashboardLayout.jsx";

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

  
  </Route>

</Routes>
  );
};

export default AppRoutes;