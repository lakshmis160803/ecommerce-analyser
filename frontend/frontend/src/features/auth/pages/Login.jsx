import { useState, useEffect, useRef } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { login, googleLogin } from "../store/authSlice";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const googleButtonRef = useRef(null);
  const googleWrapperRef = useRef(null);

  const { isAuthenticated, loading, error } = useSelector((state) => state.auth);

  const [showPassword, setShowPassword] = useState(false);
  const [btnWidth, setBtnWidth] = useState(320);

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

  // Track the actual rendered width of the button wrapper so the
  // real Google button always matches the visible custom button size.
  useEffect(() => {
    if (!googleWrapperRef.current) return;

    const observer = new ResizeObserver(([entry]) => {
      const width = Math.floor(entry.contentRect.width);
      if (width > 0) setBtnWidth(width);
    });

    observer.observe(googleWrapperRef.current);
    return () => observer.disconnect();
  }, []);

  // Initialize Google Sign-In and render the REAL button (invisible, stacked on top of custom UI)
  useEffect(() => {
    let intervalId;

    const tryInitGoogle = () => {
      if (window.google && googleButtonRef.current && btnWidth) {
        window.google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: (response) => {
            dispatch(googleLogin(response.credential))
              .unwrap()
              .then(() => toast.success("Login successful!"))
              .catch((err) => toast.error(err || "Google sign-in failed"));
          },
        });

        // Clear any previous render before re-rendering at the new width
        googleButtonRef.current.innerHTML = "";

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          theme: "outline",
          size: "large",
          width: btnWidth, // matches the actual container width now
        });

        clearInterval(intervalId);
      }
    };

    tryInitGoogle();
    intervalId = setInterval(tryInitGoogle, 300);

    return () => clearInterval(intervalId);
  }, [dispatch, btnWidth]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
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

      toast.success("Login successful!");
    } catch (err) {
      toast.error(err || "Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* LEFT */}
      <div className="w-full lg:w-1/2 bg-white flex flex-col justify-center px-6 sm:px-10 lg:px-20 py-10">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-12 h-12 bg-violet-600 rounded-xl flex items-center justify-center text-white text-xl">
           <img src="/logoEcom.png" alt="logo" />
          </div>

          <h2 className="text-3xl font-bold">
            Ecom
            <span className="text-violet-600">Intelligence</span>
          </h2>
        </div>

        <h1 className="text-6xl font-bold text-slate-900 mb-3">Welcome back</h1>

        <p className="text-slate-500 text-xl mb-10">
          Sign in to your analytics dashboard
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <label className="font-medium text-slate-700">Password</label>

              <Link
                to="/forgot-password"
                className="text-sm text-violet-600 font-medium hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-violet-600 to-purple-600 text-white py-4 rounded-2xl font-semibold shadow-lg"
          >
            {loading ? "Signing In..." : "Sign In →"}
          </button>
        </form>

        <div className="flex items-center my-8">
          <div className="flex-1 border-t"></div>
          <span className="px-4 text-slate-400">or</span>
          <div className="flex-1 border-t"></div>
        </div>

        {/* Google Sign-In: custom visual + real invisible Google button stacked on top */}
        <div
          ref={googleWrapperRef}
          className="relative w-full mb-6"
          style={{ height: "56px" }}
        >
          {/* Custom-styled visual (not clickable, purely decorative) */}
          <div className="absolute inset-0 flex items-center justify-center gap-3 border border-slate-300 rounded-2xl font-semibold text-slate-700 bg-white pointer-events-none">
            <FcGoogle size={22} />
            Continue with Google
          </div>

          {/* Real Google button - invisible, sits on top, receives the actual click */}
          <div
            ref={googleButtonRef}
            className="absolute inset-0 opacity-0"
            style={{ overflow: "hidden" }}
          ></div>
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

      {/* RIGHT */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0F0B1F] flex-col justify-center px-20 relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-violet-600 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-fuchsia-500 rounded-full blur-3xl opacity-20"></div>

        <div className="relative z-10">
          <div className="bg-violet-500/10 border border-violet-400/30 text-violet-300 px-4 py-2 rounded-full w-fit mb-8 text-sm font-medium tracking-wide">
            ⚡ AI-Powered Analytics
          </div>

          <h2 className="text-5xl font-bold leading-tight mb-6 text-white">
            Turn your store data into
            <span className="text-violet-400"> revenue insights</span>
          </h2>

          <p className="text-slate-400 text-lg mb-12 max-w-md">
            Real-time dashboards, predictive analytics and AI recommendations in one place.
          </p>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-slate-300 text-sm font-medium">Revenue — This Month</span>
              <span className="text-emerald-400 text-sm font-semibold bg-emerald-400/10 px-3 py-1 rounded-full">
                ▲ 24.6%
              </span>
            </div>

            <div className="text-4xl font-bold text-white mb-6">₹5,75,900</div>

            <div className="flex items-end gap-2 h-28">
              {[40, 65, 50, 80, 60, 95, 75].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 bg-gradient-to-t from-violet-600 to-fuchsia-400 rounded-t-md animate-[grow_1.2s_ease-out_forwards]"
                  style={{
                    height: `${h}%`,
                    animationDelay: `${i * 0.08}s`,
                    transformOrigin: "bottom",
                  }}
                ></div>
              ))}
            </div>

            <div className="flex justify-between mt-4 text-xs text-slate-500">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex-1">
              <p className="text-slate-400 text-xs mb-1">Orders</p>
              <p className="text-white text-xl font-bold">1,284</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-3 flex-1">
              <p className="text-slate-400 text-xs mb-1">Avg. Order</p>
              <p className="text-white text-xl font-bold">₹449</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;