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
  RadialBarChart,
  RadialBar,
    
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
const revenueData = revenue
  .filter((item) => item._id)
  .map((item, index) => ({
    region: item._id,
    revenue: item.revenue,
    fill: COLORS[index % COLORS.length],
  }));

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

     <div className="bg-white rounded-2xl shadow p-6">

    <div className="mb-6">
        <h2 className="text-2xl font-bold">
            💰 Revenue by Region
        </h2>

        <p className="text-gray-500">
            Revenue contribution across all regions
        </p>
    </div>

    <ResponsiveContainer width="100%" height={420}>
        <RadialBarChart
            innerRadius="25%"
            outerRadius="90%"
            data={revenueData}
            startAngle={180}
            endAngle={0}
        >
            <RadialBar
                background
                dataKey="revenue"
                cornerRadius={15}
                label={{
                    position: "insideStart",
                    fill: "#fff",
                    fontWeight: 600,
                }}
            />

            <Legend
                iconSize={12}
                layout="vertical"
                verticalAlign="middle"
                align="right"
            />

            <Tooltip
                formatter={(value) => [
                    `₹${Number(value).toLocaleString()}`,
                    "Revenue",
                ]}
            />
        </RadialBarChart>
    </ResponsiveContainer>

</div>
<ResponsiveContainer width="100%" height={320}>
  <PieChart>
    <Pie
      data={orders.filter(item => item._id)}
      dataKey="orders"
      nameKey="_id"
      innerRadius={70}
      outerRadius={110}
      paddingAngle={4}
      cornerRadius={6}
    >
      {orders.map((entry, index) => (
        <Cell
          key={index}
          fill={COLORS[index % COLORS.length]}
        />
      ))}
    </Pie>

    <Tooltip />

    <Legend
      verticalAlign="bottom"
      align="center"
      iconType="circle"
      wrapperStyle={{
        paddingTop: "20px",
        fontSize: "14px",
      }}
    />
  </PieChart>
</ResponsiveContainer>

     {/* Quantity */}
<div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">

  <div className="mb-6">
    <h2 className="text-2xl font-bold text-gray-800">
      📦 Quantity by Region
    </h2>

    <p className="text-sm text-gray-500">
      Quantity sold across all regions
    </p>
  </div>

  <ResponsiveContainer width="100%" height={320}>
    <BarChart
      data={quantity.filter(item => item._id)}
      layout="vertical"
      margin={{
        top: 10,
        right: 30,
        left: 20,
        bottom: 10,
      }}
    >
      <CartesianGrid
        horizontal={false}
        strokeDasharray="3 3"
      />

      <XAxis type="number" hide />

      <YAxis
        type="category"
        dataKey="_id"
        axisLine={false}
        tickLine={false}
        width={80}
      />

      <Tooltip
        formatter={(value) => [
          value,
          "Quantity",
        ]}
      />

      <Bar
        dataKey="quantity"
        radius={[0, 12, 12, 0]}
      >
        {quantity.map((entry, index) => (
          <Cell
            key={index}
            fill={
              ["#8B5CF6", "#22C55E", "#F97316", "#3B82F6"][index]
            }
          />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>

</div>

      {/* Regional Summary */}
<div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">

  <div className="px-6 py-5 border-b">
    <h2 className="text-2xl font-bold text-gray-800">
      📋 Regional Summary
    </h2>

    <p className="text-sm text-gray-500 mt-1">
      Revenue, Orders and Quantity across regions
    </p>
  </div>

  <div className="overflow-x-auto">
    <table className="w-full">

      <thead>
        <tr className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white">

          <th className="px-6 py-4 text-left">
            #
          </th>

          <th className="px-6 py-4 text-left">
            Region
          </th>

          <th className="px-6 py-4 text-center">
            Orders
          </th>

          <th className="px-6 py-4 text-center">
            Quantity
          </th>

          <th className="px-6 py-4 text-right">
            Revenue
          </th>

        </tr>
      </thead>

      <tbody>

        {table
          .filter(region => region._id)
          .sort((a, b) => b.revenue - a.revenue)
          .map((region, index) => (

            <tr
              key={region._id}
              className={`transition hover:bg-violet-50 ${
                index % 2 === 0
                  ? "bg-white"
                  : "bg-gray-50"
              }`}
            >

              <td className="px-6 py-4 font-semibold text-gray-500">
                {index + 1}
              </td>

              <td className="px-6 py-4">

                <span className="inline-flex items-center gap-2">

                  <span className="w-3 h-3 rounded-full bg-violet-500"></span>

                  <span className="font-semibold">
                    {region._id}
                  </span>

                </span>

              </td>

              <td className="px-6 py-4 text-center">

                <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full font-semibold">

                  {region.orders}

                </span>

              </td>

              <td className="px-6 py-4 text-center">

                <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full font-semibold">

                  {region.quantity}

                </span>

              </td>

              <td className="px-6 py-4 text-right font-bold text-emerald-600">

                ₹ {region.revenue.toLocaleString()}

              </td>

            </tr>

          ))}

           </tbody>
    </table>
  </div>

</div> 
</div> 
);
};

export default RegionalAnalysis;