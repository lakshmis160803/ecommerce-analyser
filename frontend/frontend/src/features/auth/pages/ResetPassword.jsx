import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link } from "react-router-dom";
import { resetPassword, clearAuthFlowStatus } from "../store/authSlice";
import { FiEye, FiEyeOff } from "react-icons/fi";

const ResetPassword = () => {
  const { token } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { resetPasswordStatus, resetPasswordMessage } = useSelector(
    (state) => state.auth
  );

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    return () => {
      dispatch(clearAuthFlowStatus());
    };
  }, [dispatch]);

  useEffect(() => {
    if (resetPasswordStatus === "success") {
      const timer = setTimeout(() => navigate("/"), 2000);
      return () => clearTimeout(timer);
    }
  }, [resetPasswordStatus, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    dispatch(resetPassword({ token, password }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Reset Password
        </h1>
        <p className="text-slate-500 mb-8">Enter your new password below.</p>

        {resetPasswordStatus === "success" ? (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl p-4 text-sm">
            {resetPasswordMessage} Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-slate-700">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full border border-slate-300 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-5 text-slate-500"
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Confirm New Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-slate-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {(formError || resetPasswordStatus === "error") && (
              <p className="text-red-600 text-sm">
                {formError || resetPasswordMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={resetPasswordStatus === "loading"}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg"
            >
              {resetPasswordStatus === "loading"
                ? "Resetting..."
                : "Reset Password"}
            </button>
          </form>
        )}

        <p className="text-center text-slate-500 mt-8">
          <Link to="/" className="text-violet-600 font-medium">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;