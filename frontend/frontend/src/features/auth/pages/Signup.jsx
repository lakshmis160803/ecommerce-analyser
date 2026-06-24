
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../../api/axiosInstance";

const SignUp = () => {
  const navigate = useNavigate();
  
 
  const [formData, setFormData] = useState({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
});

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

 const handleSubmit = async (e) => {
  e.preventDefault();

  setError("");

  if (
    formData.password !==
    formData.confirmPassword
  ) {
    setError("Passwords do not match");
    return;
  }

  try {
    await axiosInstance.post(
      "/auth/register",
      {
        name: formData.name,
        email: formData.email,
        password: formData.password,
      }
    );

    alert("User created successfully");

    navigate("/");
  } catch (err) {
    setError(
      err.response?.data?.message ||
      "Registration failed"
    );
  }
};

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-8">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-xl p-10">
        <h1 className="text-4xl font-bold mb-2">
          Sign Up
        </h1>

        <p className="text-slate-500 mb-8">
          Create a new account
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >
          <div>
            <label className="block mb-2">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border rounded-xl p-4"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block mb-2">
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full border rounded-xl p-4"
              placeholder="john@example.com"
            />
          </div>

          <div>
            <label className="block mb-2">
              Password
            </label>

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border rounded-xl p-4"
              placeholder="Password"
            />
          </div>

          <div>
            <label className="block mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full border rounded-xl p-4"
              placeholder="Confirm Password"
            />
          </div>

          {error && (
            <p className="text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-4 rounded-xl font-semibold"
          >
            Create Account
          </button>
        </form>

        <p className="mt-6 text-center">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-violet-600 font-semibold"
          >
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignUp;