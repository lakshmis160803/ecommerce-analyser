import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { forgotPassword } from "../store/authSlice";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const { forgotPasswordStatus, forgotPasswordMessage } = useSelector(
    (state) => state.auth
  );
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(forgotPassword({ email }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Forgot Password
        </h1>
        <p className="text-slate-500 mb-8">
          Enter your email and we'll send you a reset link.
        </p>

        {forgotPasswordStatus === "success" ? (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-2xl p-4 text-sm">
            {forgotPasswordMessage}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-medium text-slate-700">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                required
                className="w-full border border-slate-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {forgotPasswordStatus === "error" && (
              <p className="text-red-600 text-sm">{forgotPasswordMessage}</p>
            )}

            <button
              type="submit"
              disabled={forgotPasswordStatus === "loading"}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg"
            >
              {forgotPasswordStatus === "loading"
                ? "Sending..."
                : "Send Reset Link"}
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

export default ForgotPassword;