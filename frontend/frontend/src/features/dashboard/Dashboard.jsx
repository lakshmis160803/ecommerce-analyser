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
  CartesianGrid,
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
  const [showAllUploads, setShowAllUploads] = useState(false);
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
      console.log("[fetchUploads] raw response:", res.data);

      const result = Array.isArray(res.data)
        ? res.data
        : res.data.data;

      console.log("[fetchUploads] unwrapped result:", result);

      const productUploads = Array.isArray(result)
        ? result.filter((item) => item.fileType === "product")
        : [];

      console.log("[fetchUploads] after fileType filter:", productUploads);

      setUploads(productUploads);
    } catch (error) {
      console.log("[fetchUploads] ERROR:", error);
      setUploads([]);
    }
  };

  // ✅ Fetch stats — passes uploadId in URL, empty string = all products
  const fetchDashboardStats = async (uploadId) => {
    setLoadingStats(true);

    try {
      const endpoint = uploadId
        ? `/upload/dashboard?uploadId=${uploadId}`
        : "/upload/dashboard";

      const res = await axiosInstance.get(endpoint);
      console.log("[fetchDashboardStats] raw response:", res.data);

      setStats(res.data || {});
    } catch (error) {
      console.log("[fetchDashboardStats] ERROR:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchRatingDistribution = async (uploadId) => {
    try {
      const endpoint = uploadId
        ? `/products/rating-distribution?uploadId=${uploadId}`
        : "/products/rating-distribution";

      const res = await axiosInstance.get(endpoint);
      console.log("[fetchRatingDistribution] raw response:", res.data);

      const result = Array.isArray(res.data) ? res.data : res.data?.data;
      setRatingData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.log("[fetchRatingDistribution] ERROR:", error);
      setRatingData([]);
    }
  };

  const fetchCategoryDistribution = async (uploadId) => {
    try {
      const endpoint = uploadId
        ? `/products/category-distribution?uploadId=${uploadId}`
        : "/products/category-distribution";

      const res = await axiosInstance.get(endpoint);
      console.log("[fetchCategoryDistribution] raw response:", res.data);

      const result = Array.isArray(res.data) ? res.data : res.data?.data;
      setCategoryData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.log("[fetchCategoryDistribution] ERROR:", error);
      setCategoryData([]);
    }
  };

  const fetchPriceDistribution = async (uploadId) => {
    try {
      const endpoint = uploadId
        ? `/products/price-distribution?uploadId=${uploadId}`
        : "/products/price-distribution";

      const res = await axiosInstance.get(endpoint);
      console.log("[fetchPriceDistribution] raw response:", res.data);

      const result = Array.isArray(res.data) ? res.data : res.data?.data;
      setPriceData(Array.isArray(result) ? result : []);
    } catch (error) {
      console.log("[fetchPriceDistribution] ERROR:", error);
      setPriceData([]);
    }
  };

  // Fetch uploads once on mount
  useEffect(() => {
    fetchUploads();
  }, []);

  // Re-fetch stats whenever selected upload changes
  useEffect(() => {
    fetchDashboardStats(selectedUpload);
    fetchRatingDistribution(selectedUpload);
    fetchCategoryDistribution(selectedUpload);
    fetchPriceDistribution(selectedUpload);
  }, [selectedUpload]);

  // ✅ Label shown above stats cards
  const selectedLabel = selectedUpload
    ? uploads.find((u) => u._id === selectedUpload)?.fileName || "Selected Upload"
    : "All Uploads";

  const processedCategoryData = (() => {
    if (!Array.isArray(categoryData)) return [];

    const sorted = [...categoryData].sort((a, b) => b.count - a.count);

    const topCategories = sorted.slice(0, 6);

    const othersCount = sorted
      .slice(6)
      .reduce((sum, item) => sum + item.count, 0);

    if (othersCount > 0) {
      topCategories.push({
        _id: "Others",
        count: othersCount,
      });
    }

    return topCategories;
  })();

  const displayedUploads = showAllUploads
    ? [...uploads].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    : [...uploads]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10">
        <div className="bg-white rounded-xl shadow p-4 sm:p-6 lg:p-8o">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Dashboard</h1>

          <p className="text-sm sm:text-base text-slate-600 mb-6">
            Welcome back,
            <span className="font-semibold ml-2">{user?.name}</span>
          </p>

          {/* ✅ Dataset Selector */}
          <div className="mb-6">
            <label className="block mb-2 font-semibold">Select Dataset</label>
            <select
              value={selectedUpload}
              onChange={(e) => setSelectedUpload(e.target.value)}
              className="border p-3 rounded-lg w-full sm:w-80"
            >
              <option value="">All Uploads</option>
              {displayedUploads.map((upload) => (
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
          <div className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 transition-opacity ${loadingStats ? "opacity-40" : "opacity-100"}`}>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-bold mb-4">Rating Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={Array.isArray(ratingData) ? ratingData : []}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="42%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    label={false}
                  >
                    {Array.isArray(ratingData) &&
                      ratingData.map((entry, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                  </Pie>

                  <Tooltip />

                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: 12,
                      paddingTop: 10,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-bold mb-4">Category Distribution</h2>

              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={processedCategoryData}
                    dataKey="count"
                    nameKey="_id"
                    cx="50%"
                    cy="42%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    label={false}
                  >
                    {processedCategoryData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip />

                  <Legend
                    layout="horizontal"
                    verticalAlign="bottom"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{
                      fontSize: 12,
                      paddingTop: 10,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h2 className="font-bold mb-4">Price Distribution</h2>

              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={Array.isArray(priceData) ? priceData : []}>
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="productName"
                    angle={-45}
                    textAnchor="end"
                    tick={{ fontSize: 10 }}
                    height={90}
                  />

                  <YAxis />

                  <Tooltip formatter={(value) => [`₹${value}`, "Price"]} />

                  <Bar dataKey="price" fill="#7C3AED" radius={[8, 8, 0, 0]} />
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
                    {displayedUploads.map((upload) => (
                      <tr
                        key={upload._id}
                        className={`border-b hover:bg-slate-50 ${
                          selectedUpload === upload._id ? "bg-violet-50" : ""
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
                            className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                              selectedUpload === upload._id
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

          {uploads.length > 5 && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAllUploads(!showAllUploads)}
                className="px-5 py-2 bg-violet-100 text-violet-700 rounded-lg hover:bg-violet-200 font-medium"
              >
                {showAllUploads ? "Show Less" : `Show More (${uploads.length - 5} more)`}
              </button>
            </div>
          )}

          <div className="mt-10">
            <Link
              to="/upload"
              className="w-full sm:w-auto bg-violet-600 text-white px-6 py-3 rounded-lg"
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