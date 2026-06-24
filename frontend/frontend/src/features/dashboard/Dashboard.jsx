import { useNavigate, Link } from "react-router-dom";
import { logout } from "../auth/store/authSlice";
import axiosInstance from "../../api/axiosInstance";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";
const COLORS = [
  "#7C3AED",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];
const Dashboard = () => {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState(""); // "" = all products

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    totalProducts: 0,
    totalRevenue: 0,
    totalStock: 0,
    totalSoldUnits: 0,
    avgRating: 0,
  });

  const [loadingStats, setLoadingStats] = useState(false);
  const [ratingData, setRatingData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [priceData, setPriceData] = useState([]);

 
  const { user } = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await axiosInstance.post("/auth/logout");
      dispatch(logout());
      navigate("/");
    } catch (err) {
      console.log(err);
    }
  };

  // ✅ Fetch all upload history for the dropdown
  const fetchUploads = async () => {
    try {
      const res = await axiosInstance.get("/upload/uploads");

      const result = Array.isArray(res.data)
        ? res.data
        : res.data.data;

      const productUploads = result.filter(
        (item) => item.fileType === "product"
      );

      setUploads(productUploads);
    } catch (error) {
      console.log(error);
      setUploads([]);
    }
  };

  // ✅ Fetch stats — passes uploadId in URL, empty string = all products
  const fetchDashboardStats = async (uploadId) => {
    setLoadingStats(true);
    try {
      const res = await axiosInstance.get(
        `/upload/dashboard/${uploadId}`
      );
      setStats(res.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingStats(false);
    }
  };
  const fetchRatingDistribution =
    async (uploadId) => {
      try {
        const endpoint = uploadId
          ? `/products/rating-distribution?uploadId=${uploadId}`
          : "/products/rating-distribution";

        const res =
          await axiosInstance.get(
            endpoint
          );

        setRatingData(res.data);
      } catch (error) {
        console.log(error);
      }
    };
    const fetchCategoryDistribution =
  async (uploadId) => {
    const endpoint = uploadId
      ? `/products/category-distribution?uploadId=${uploadId}`
      : "/products/category-distribution";

    const res =
      await axiosInstance.get(
        endpoint
      );

    setCategoryData(res.data);
  };
  const fetchPriceDistribution =
  async (uploadId) => {
    const endpoint = uploadId
      ? `/products/price-distribution?uploadId=${uploadId}`
      : "/products/price-distribution";

    const res =
      await axiosInstance.get(
        endpoint
      );

    setPriceData(res.data);
  };

  // Fetch uploads once on mount
  useEffect(() => {
    fetchUploads();
  }, []);

  // Re-fetch stats whenever selected upload changes
 useEffect(() => {
  fetchDashboardStats(
    selectedUpload
  );

  fetchRatingDistribution(
    selectedUpload
  );

  fetchCategoryDistribution(
    selectedUpload
  );

  fetchPriceDistribution(
    selectedUpload
  );
}, [selectedUpload]);

  // ✅ Label shown above stats cards
  const selectedLabel = selectedUpload
    ? uploads.find((u) => u._id === selectedUpload)?.fileName || "Selected Upload"
    : "All Uploads";

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white shadow-lg p-6">
        <h2 className="text-2xl font-bold text-violet-600 mb-8">
          Ecom Intelligence
        </h2>

        <nav className="space-y-3">
          <Link to="/dashboard" className="block p-3 rounded-lg hover:bg-violet-100">Dashboard</Link>
          <Link to="/upload" className="block p-3 rounded-lg hover:bg-violet-100">Upload Data</Link>
          <Link to="/products" className="block p-3 rounded-lg hover:bg-violet-100">Product Analysis</Link>
          <Link to="/customers" className="block p-3 rounded-lg hover:bg-violet-100">Customer Analysis</Link>
          <Link to="/regional" className="block p-3 rounded-lg hover:bg-violet-100">Regional Analysis</Link>
          <Link to="/orders" className="block p-3 rounded-lg hover:bg-violet-100">Order Analysis</Link>
          <Link to="/inventory" className="block p-3 rounded-lg hover:bg-violet-100">Inventory Analysis</Link>
          <Link to="/reports" className="block p-3 rounded-lg hover:bg-violet-100">Reports</Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-10 w-full bg-red-500 text-white py-3 rounded-lg"
        >
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10">
        <div className="bg-white rounded-xl shadow p-8">
          <h1 className="text-4xl font-bold mb-4">Dashboard</h1>

          <p className="text-slate-600 mb-6">
            Welcome back,
            <span className="font-semibold ml-2">{user?.name}</span>
          </p>

          {/* ✅ Dataset Selector */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Select Dataset</label>
            <select
              value={selectedUpload}
              onChange={(e) => setSelectedUpload(e.target.value)}
              className="border p-3 rounded-lg w-80"
            >
              <option value="">All Uploads</option>
              {uploads.map((upload) => (
                <option key={upload._id} value={upload._id}>
                  {upload.fileName} — {upload.totalRecords} records &nbsp;
                  ({new Date(upload.createdAt).toLocaleDateString()})
                </option>
              ))}
            </select>

            {/* ✅ Shows which dataset stats are for */}
            <p className="text-sm text-slate-400 mt-2">
              Showing stats for: <span className="font-medium text-slate-600">{selectedLabel}</span>
            </p>
          </div>

          {/* ✅ Stats Cards */}
          <div className={`grid grid-cols-4 gap-6 transition-opacity ${loadingStats ? "opacity-40" : "opacity-100"}`}>
            <div className="bg-violet-100 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500">Total Revenue</h3>
              <p className="text-3xl font-bold mt-2">
                ₹{stats.totalRevenue?.toLocaleString() ?? 0}
              </p>
            </div>

            <div className="bg-blue-100 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500">Total Stock</h3>
              <p className="text-3xl font-bold mt-2">
                {stats.totalStock ?? 0}
              </p>
            </div>

            <div className="bg-green-100 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500">Sold Units</h3>
              <p className="text-3xl font-bold mt-2">
                {stats.totalSoldUnits ?? 0}
              </p>
            </div>

            <div className="bg-orange-100 p-6 rounded-xl">
              <h3 className="text-sm font-medium text-slate-500">Products</h3>
              <p className="text-3xl font-bold mt-2">
                {stats.totalProducts ?? 0}
              </p>
            </div>
           
          </div>
           {/* Rating Distribution */}
            

<div className="grid lg:grid-cols-3 gap-6 mt-8">
  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="font-bold mb-4">Ratings</h2>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={ratingData}
          dataKey="count"
          nameKey="_id"
          outerRadius={100}
          label
        >
          {ratingData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="font-bold mb-4">Categories</h2>
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={categoryData}
          dataKey="count"
          nameKey="_id"
          outerRadius={100}
          label
        >
          {categoryData.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

  <div className="bg-white p-6 rounded-xl shadow">
    <h2 className="font-bold mb-4">Price Distribution</h2>
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={priceData}>
        <XAxis dataKey="_id" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="count" fill="#7C3AED" />
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>

          {/* ✅ Upload History Table */}
          {uploads.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold mb-4">Upload History</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-100 text-left">
                      <th className="p-3 rounded-tl-lg">File Name</th>
                      <th className="p-3">Records</th>
                      <th className="p-3">Uploaded On</th>
                      <th className="p-3 rounded-tr-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uploads.map((upload) => (
                      <tr
                        key={upload._id}
                        className={`border-b hover:bg-slate-50 ${selectedUpload === upload._id ? "bg-violet-50" : ""
                          }`}
                      >
                        <td className="p-3 font-medium">{upload.fileName}</td>
                        <td className="p-3">{upload.totalRecords}</td>
                        <td className="p-3 text-slate-500">
                          {new Date(upload.createdAt).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <button
                            onClick={() => setSelectedUpload(upload._id)}
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${selectedUpload === upload._id
                              ? "bg-violet-600 text-white"
                              : "bg-violet-100 text-violet-700 hover:bg-violet-200"
                              }`}
                          >
                            {selectedUpload === upload._id ? "Viewing" : "View Stats"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="mt-10">
            <Link
              to="/upload"
              className="bg-violet-600 text-white px-6 py-3 rounded-lg"
            >
              Upload CSV Data
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;