import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#7C3AED",
  "#06B6D4",
  "#10B981",
  "#F59E0B",
  "#EF4444",
];

const OrderAnalytics = () => {
  const [stats, setStats] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [dateData, setDateData] = useState([]);
  const [loading, setLoading] = useState(true);
const [uploads, setUploads] = useState([]);
const [selectedUpload, setSelectedUpload] = useState("");
const fetchData = async () => {
  try {
    setLoading(true);

    const query = selectedUpload
      ? `?uploadId=${selectedUpload}`
      : "";

const [
  statsRes,
  productRes,
  dateRes,
] = await Promise.all([
  axiosInstance.get(`/orders/stats${query}`),
  axiosInstance.get(`/orders/by-product${query}`),
  axiosInstance.get(`/orders/by-date${query}`),
]);

      setStats(statsRes.data);
      setProductData(productRes.data);
      setDateData(dateRes.data);

      // Build status chart if status exists
     
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const hasProducts =
  productData.length > 0;
  
  const hasTrend =
  dateData.length > 0;
  
  const hasRevenue =
  stats.totalRevenue > 0;
  
  const hasStatus =
  statusData.some(
    (item) => item.value > 0
);
const fetchUploads = async () => {
  try {
    const res = await axiosInstance.get("/upload/uploads");

    const result = Array.isArray(res.data)
      ? res.data
      : res.data.data;

    setUploads(
      result.filter(
        (item) => item.fileType === "order"
      )
    );
  } catch (error) {
    console.log(error);
  }
};
useEffect(() => {
 fetchData();
}, [selectedUpload]);
useEffect(() => {
 fetchUploads();
}, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-100 p-8">

      <h1 className="text-4xl font-bold mb-8">
        Order Analytics
      </h1>
<div className="mb-8 bg-white p-4 rounded-2xl shadow-sm">
  <label className="block text-sm font-semibold mb-2">
    Select Order Dataset
  </label>

  <select
    value={selectedUpload}
    onChange={(e) =>
      setSelectedUpload(e.target.value)
    }
    className="border p-2 rounded-lg w-72"
  >
    <option value="">
      All Order Uploads
    </option>

    {uploads.map((upload) => (
      <option
        key={upload._id}
        value={upload._id}
      >
        {upload.fileName}
      </option>
    ))}
  </select>
</div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-slate-500">
            Total Orders
          </h3>

          <p className="text-3xl font-bold text-violet-600 mt-2">
            {stats.totalOrders || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-slate-500">
            Revenue
          </h3>

          <p className="text-3xl font-bold text-green-600 mt-2">
            ₹
            {(
              stats.totalRevenue || 0
            ).toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-slate-500">
            Quantity Sold
          </h3>

          <p className="text-3xl font-bold text-cyan-600 mt-2">
            {stats.totalQuantity || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-slate-500">
            Avg Order Value
          </h3>

          <p className="text-3xl font-bold text-orange-500 mt-2">
            ₹
            {Math.round(
              stats.avgOrderValue || 0
            )}
          </p>
        </div>

      </div>

      {loading ? (
        <div className="text-center text-xl">
          Loading...
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-8">

          {/* Top Products */}
      {hasProducts && (
<div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Top Ordered Products
            </h2>

            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <BarChart data={productData}>
                <XAxis
  dataKey="_id"
  interval={0}
  angle={-20}
  textAnchor="end"
/>
                <YAxis />
                <Tooltip />

                <Bar
                  dataKey="quantity"
                  fill="#7C3AED"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          )}
          

          {/* Revenue Trend */}
          {hasTrend && (
<div className="bg-white p-6 rounded-3xl shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              Orders Trend
            </h2>

            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <LineChart data={dateData}>
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />

                <Line
  type="monotone"
  dataKey={
    hasRevenue
      ? "revenue"
      : "orders"
  }
  stroke="#7C3AED"
/>
              </LineChart>
            </ResponsiveContainer>
          </div>
)}
          {hasStatus && (
<div className="bg-white p-6 rounded-3xl shadow-lg lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">
              Order Status
            </h2>

            <ResponsiveContainer
              width="100%"
              height={350}
            >
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={120}
                  label
                >
                  {statusData.map(
                    (entry, index) => (
                      <Cell
                        key={index}
                        fill={
                          COLORS[
                            index %
                              COLORS.length
                          ]
                        }
                      />
                    )
                  )}
                </Pie>

                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderAnalytics;