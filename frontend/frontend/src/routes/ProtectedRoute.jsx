import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const {
    isAuthenticated,
    loading,
  } = useSelector(
    (state) => state.auth
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        Loading...
      </div>
    );
  }

  return isAuthenticated ? (
    children
  ) : (
    <Navigate to="/" replace />
  );
};

export default ProtectedRoute;