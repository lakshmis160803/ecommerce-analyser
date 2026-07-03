import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import {
  FaGlobeAsia,
  FaRupeeSign,
} from "react-icons/fa";

import {
  MdLocationOn,
} from "react-icons/md";

import {
  BsCartCheckFill,
} from "react-icons/bs";
const COLORS = [
  "#7c3aed",
  "#22c55e",
  "#f97316",
  "#3b82f6",
  "#ef4444",
];

const RegionalAnalysis = () => {
  const [dashboard, setDashboard] = useState({});
  const [revenue, setRevenue] = useState([]);
  const [orders, setOrders] = useState([]);
  const [quantity, setQuantity] = useState([]);
  const [table, setTable] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        dashboardRes,
        revenueRes,
        ordersRes,
        quantityRes,
        tableRes,
      ] = await Promise.all([
        axiosInstance.get("/regional/dashboard"),
        axiosInstance.get("/regional/revenue"),
        axiosInstance.get("/regional/orders"),
        axiosInstance.get("/regional/quantity"),
        axiosInstance.get("/regional/table"),
      ]);

      console.log("Dashboard:", dashboardRes.data);
      console.log("Revenue:", revenueRes.data);
      console.log("Orders:", ordersRes.data);
      console.log("Quantity:", quantityRes.data);
      console.log("Table:", tableRes.data);

      setDashboard(dashboardRes.data);
      setRevenue(revenueRes.data);
      setOrders(ordersRes.data);
      setQuantity(quantityRes.data);
      setTable(tableRes.data);
    } catch (err) {
      console.error("Regional API Error:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Failed to load regional analytics"
      );
    } finally {
      setLoading(false);
    }
  };

  console.log({
    dashboard,
    revenue,
    orders,
    quantity,
    table,
    loading,
    error,
  });

  if (loading) {
    return (
      <div className="p-8 text-xl font-semibold">
        Loading Regional Analytics...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-red-600">
        <h2 className="text-xl font-bold mb-2">
          Failed to Load Regional Analytics
        </h2>

        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <h1 className="text-3xl font-bold">
        Regional Analysis
      </h1>

      {/* Dashboard */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="font-semibold mb-3">
          Dashboard Summary
        </h2>

       {/* KPI Cards */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

<div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl shadow-lg p-6 flex justify-between items-center">

  <div>
    <p className="text-sm opacity-80">
      Total Regions
    </p>

    <h2 className="text-3xl font-bold mt-2">
      {dashboard.totalRegions}
    </h2>
  </div>

  <FaGlobeAsia size={42} className="opacity-80" />

</div>

 <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg p-6 flex justify-between items-center">

  <div>
    <p className="text-sm opacity-80">
      Total Revenue
    </p>

    <h2 className="text-3xl font-bold mt-2">
      ₹ {dashboard.totalRevenue?.toLocaleString()}
    </h2>
  </div>

  <FaRupeeSign size={42} className="opacity-80" />

</div>

 <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl shadow-lg p-6 flex justify-between items-center">

  <div>
    <p className="text-sm opacity-80">
      Highest Revenue Region
    </p>

    <h2 className="text-2xl font-bold mt-2">
      {dashboard.highestRevenueRegion}
    </h2>
  </div>

  <MdLocationOn size={42} className="opacity-80" />

</div>

 <div className="bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl shadow-lg p-6 flex justify-between items-center">

  <div>
    <p className="text-sm opacity-80">
      Highest Orders Region
    </p>

    <h2 className="text-2xl font-bold mt-2">
      {dashboard.highestOrdersRegion}
    </h2>
  </div>

  <BsCartCheckFill size={42} className="opacity-80" />

</div>

</div>
      </div>

      {/* Revenue */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="font-semibold mb-3">
          Revenue Data
        </h2>

        <div className="bg-white rounded-xl shadow p-6">
  <h2 className="text-xl font-semibold mb-4">
    Revenue by Region
  </h2>
<ResponsiveContainer width="100%" height={350}>
  <BarChart
    data={revenue.filter((item) => item._id)}
    margin={{
      top: 20,
      right: 30,
      left: 50,
      bottom: 20,
    }}
  >
    <CartesianGrid strokeDasharray="3 3" />

    <XAxis dataKey="_id" />

    <YAxis
      width={80}
      tickFormatter={(value) => value.toLocaleString()}
    />

    <Tooltip
      formatter={(value) => [
        `₹${Number(value).toLocaleString()}`,
        "Revenue",
      ]}
    />

    <Legend />

    <Bar
      dataKey="revenue"
      fill="#7c3aed"
      radius={[8, 8, 0, 0]}
    />
  </BarChart>
</ResponsiveContainer>
</div>
      </div>

      {/* Orders */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="font-semibold mb-3">
          Orders Data
        </h2>

      <div className="bg-white rounded-xl shadow p-6">
  <h2 className="text-xl font-semibold mb-4">
    Orders by Region
  </h2>

  <ResponsiveContainer width="100%" height={350}>
    <PieChart>
      <Pie
        data={orders}
        dataKey="orders"
        nameKey="_id"
        outerRadius={120}
        label
      >
        {orders.map((entry, index) => (
          <Cell
            key={index}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </Pie>

      <Tooltip />
      <Legend />
    </PieChart>
  </ResponsiveContainer>
</div>
      </div>

      {/* Quantity */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="font-semibold mb-3">
          Quantity Data
        </h2>

       <ResponsiveContainer width="100%" height={350}>
  <BarChart data={quantity.filter(item => item._id)}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="_id" />
    <YAxis />
    <Tooltip />
    <Legend />
    <Bar
      dataKey="quantity"
      fill="#22c55e"
      radius={[8, 8, 0, 0]}
    />
  </BarChart>
</ResponsiveContainer>
      </div>

      {/* Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <h2 className="font-semibold mb-3">
          Table Data
        </h2>

        <table className="w-full border-collapse">
  <thead>
    <tr className="bg-purple-600 text-white">
      <th className="p-3">Region</th>
      <th className="p-3">Orders</th>
      <th className="p-3">Quantity</th>
      <th className="p-3">Revenue</th>
    </tr>
  </thead>

  <tbody>
    {table
      .filter(region => region._id)
      .map(region => (
        <tr key={region._id} className="border-b hover:bg-gray-50">
          <td className="p-3">{region._id}</td>
          <td className="p-3">{region.orders}</td>
          <td className="p-3">{region.quantity}</td>
          <td className="p-3">
            ₹{region.revenue.toLocaleString()}
          </td>
        </tr>
      ))}
  </tbody>
</table>
      </div>
    </div>
  );
};

export default RegionalAnalysis;