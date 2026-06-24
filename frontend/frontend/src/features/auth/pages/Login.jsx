
import { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate,Link } from "react-router-dom";
import { login } from "../store/authSlice";


const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  

  const { isAuthenticated, loading, error } =
    useSelector((state) => state.auth);

  const [showPassword, setShowPassword] =
    useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } =
      e.target;

    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? checked
          : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await dispatch(
        login({
          email: formData.email,
          password: formData.password,
        })
      ).unwrap();

      console.log("Login Success");
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* LEFT */}
      <div className="w-1/2 bg-white flex flex-col justify-center px-20">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-white text-xl">
            📊
          </div>

          <h2 className="text-3xl font-bold">
            Ecom
            <span className="text-violet-600">
              Intelligence
            </span>
          </h2>
        </div>

        <h1 className="text-6xl font-bold text-slate-900 mb-3">
          Welcome back
        </h1>

        <p className="text-slate-500 text-xl mb-10">
          Sign in to your analytics dashboard
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div>
            <label className="block mb-2 font-medium text-slate-700">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@company.com"
              className="w-full border border-slate-300 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-slate-700">
                Password
              </label>

              <button
                type="button"
                className="text-violet-600"
              >
                Forgot Password?
              </button>
            </div>

            <div className="relative">
              <input
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full border border-slate-300 rounded-2xl p-4 pr-12 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    !showPassword
                  )
                }
                className="absolute right-4 top-5 text-slate-500"
              >
                {showPassword ? (
                  <FiEyeOff size={20} />
                ) : (
                  <FiEye size={20} />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="rememberMe"
              checked={
                formData.rememberMe
              }
              onChange={handleChange}
            />

            <span className="text-slate-600">
              Remember me for 30 days
            </span>
          </div>

          {error && (
            <p className="text-red-500 text-sm">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg"
          >
            {loading
              ? "Signing In..."
              : "Sign In →"}
          </button>
        </form>

       <div className="flex items-center my-8">
  <div className="flex-1 border-t"></div>
  <span className="px-4 text-slate-400">
    or
  </span>
  <div className="flex-1 border-t"></div>
</div>

<div className="text-center">
  <Link
    to="/signup"
    className="inline-flex items-center justify-center w-full border border-violet-600 text-violet-600 py-4 rounded-2xl font-semibold hover:bg-violet-50"
  >
    Create New Account
  </Link>
</div>

<p className="text-center text-slate-500 mt-6">
  New to Ecom Intelligence?
</p>

      
      </div>

    
      <div className="w-1/2 bg-violet-50 flex flex-col justify-center px-20">
        <div className="bg-violet-100 text-violet-700 px-4 py-2 rounded-full w-fit mb-8">
          ⚡ AI-Powered Analytics
        </div>

        <h2 className="text-6xl font-bold leading-tight mb-6">
          Turn your store data into
          <span className="text-violet-600">
            {" "}
            revenue insights
          </span>
        </h2>

        <p className="text-slate-600 text-xl mb-10">
          Real-time dashboards,
          predictive analytics and AI
          recommendations in one place.
        </p>
      </div>
    </div>
  );
};

export default Login;  