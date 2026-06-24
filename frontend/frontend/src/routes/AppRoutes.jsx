import { Routes, Route } from "react-router-dom";
import Login from "../features/auth/pages/Login";
import Dashboard from "../features/dashboard/Dashboard";
import SignUp from "../features/auth/pages/Signup";
import UploadData from "../features/imports/pages/UploadData";
import ProtectedRoute from "./ProtectedRoute";
import ProductAnalysis from "../features/analytics/pages/ProductAnalysis";
import OrderAnalytics from "../features/analytics/pages/orderAnalytics";

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        path="/signup"
        element={<SignUp />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
<Route
  path="/products"
  element={
    <ProtectedRoute>
      <ProductAnalysis />
    </ProtectedRoute>
  }
/>
      <Route
        path="/upload"
        element={
          <ProtectedRoute>
            <UploadData />
          </ProtectedRoute>
        }
      />
      <Route
  path="/product-analysis"
  element={<ProductAnalysis />}
/>
<Route
  path="/orders"
  element={<OrderAnalytics />}
/>
    </Routes>
  );
};

export default AppRoutes;