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
  const [dateRange, setDateRange] = useState("last7days");
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [allOrders, setAllOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const fetchData = async () => {
    try {
      setLoading(true);

      const query = `?range=${dateRange}`;

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

  const fetchAllOrders = async () => {
  try {
const endpoint = `/orders/all-orders?range=${dateRange}`;

    const res = await axiosInstance.get(endpoint);

    setAllOrders(res.data);

    setShowAllOrders(true);

  } catch (error) {
    console.log(error);
  }
};
const filteredOrders = [...allOrders]
  .filter((order) =>
    order.customerName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  )
  .sort((a, b) => {

    switch (sortBy) {

      case "amount":
        return (b.price * b.quantity) - (a.price * a.quantity);

      case "quantity":
        return b.quantity - a.quantity;

      case "customer":
        return a.customerName.localeCompare(b.customerName);

      case "date":
      default:
        return new Date(b.orderDate) - new Date(a.orderDate);

    }

  });

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
}, [dateRange]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-100 p-8">

      <h1 className="text-4xl font-bold mb-8">
        Order Analytics
      </h1>
      <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm">
       <div className="mb-8 bg-white p-5 rounded-2xl shadow-sm">

  <label className="block text-sm font-semibold mb-2">
    Date Range
  </label>

  <select
    value={dateRange}
    onChange={(e)=>setDateRange(e.target.value)}
    className="border rounded-lg p-2 w-72"
  >

      <option value="today">Today</option>

      <option value="yesterday">
        Yesterday
      </option>

      <option value="last7days">
        Last 7 Days
      </option>

      <option value="last30days">
        Last 30 Days
      </option>

      <option value="thisMonth">
        This Month
      </option>

      <option value="lastMonth">
        Last Month
      </option>

      <option value="last3months">
        Last 3 Months
      </option>

      <option value="thisYear">
        This Year
      </option>

      <option value="all">
        All Time
      </option>

  </select>

</div>
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
             <div className="flex justify-between items-center mb-4">
  <div>
    <h2 className="text-xl font-semibold">
      Top Ordered Products
    </h2>

    <p className="text-sm text-slate-500">
      Showing {productData.length} of {stats.totalOrders} Orders
    </p>
  </div>

  <button
    onClick={fetchAllOrders}
    className="bg-violet-600 hover:bg-violet-700 text-white px-5 py-2 rounded-lg"
  >
    View All Orders
  </button>
</div>

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

             <ResponsiveContainer width="100%" height={350}>
  <LineChart
    data={dateData}
    margin={{
      top: 20,
      right: 20,
      left: 40,
      bottom: 20,
    }}
  >
    <CartesianGrid strokeDasharray="3 3" />

    <XAxis
      dataKey="month"
      tick={{ fontSize: 12 }}
    />

    <YAxis
      width={75}
      tick={{ fontSize: 12 }}
      tickFormatter={(value) =>
        hasRevenue
          ? `₹${(value / 100000).toFixed(1)}L`
          : value
      }
    />

    <Tooltip
      formatter={(value) => [
        hasRevenue
          ? `₹${Number(value).toLocaleString("en-IN")}`
          : value,
        hasRevenue ? "Revenue" : "Orders",
      ]}
    />

    <Line
      type="monotone"
      dataKey={hasRevenue ? "revenue" : "orders"}
      stroke="#7C3AED"
      strokeWidth={3}
      dot={{ r: 4 }}
      activeDot={{ r: 6 }}
    />
  </LineChart>
</ResponsiveContainer>
            </div>
          )}
        </div>
      )}
      {showAllOrders && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-7xl h-[90vh] overflow-hidden">

      {/* Header */}

      <div className="flex justify-between items-center border-b px-8 py-5">

        <div>

          <h2 className="text-3xl font-bold">
            📦 All Orders
          </h2>

          <p className="text-gray-500">
            {filteredOrders.length} Orders
          </p>

        </div>

        <button
          onClick={() => setShowAllOrders(false)}
          className="text-3xl text-red-500 hover:text-red-700"
        >
          ✕
        </button>

      </div>

      {/* Search + Sort */}

      <div className="flex justify-between items-center p-6 border-b">

        <input
          type="text"
          placeholder="Search customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-80"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="date">Latest Orders</option>
          <option value="amount">Highest Revenue</option>
          <option value="quantity">Highest Quantity</option>
          <option value="customer">Customer Name</option>
        </select>

      </div>

      {/* Summary */}

      <div className="grid grid-cols-4 gap-5 p-6">

        <div className="bg-violet-50 rounded-xl p-4">
          <p className="text-gray-500">Orders</p>
          <h2 className="text-3xl font-bold">
            {filteredOrders.length}
          </h2>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-gray-500">Revenue</p>
          <h2 className="text-3xl font-bold">
            ₹
            {filteredOrders
              .reduce((a, b) => a + b.price * b.quantity, 0)
              .toLocaleString()}
          </h2>
        </div>

        <div className="bg-cyan-50 rounded-xl p-4">
          <p className="text-gray-500">Quantity Sold</p>
          <h2 className="text-3xl font-bold">
            {filteredOrders.reduce((a, b) => a + b.quantity, 0)}
          </h2>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4">
          <p className="text-gray-500">Average Order Value</p>
          <h2 className="text-3xl font-bold">
            ₹
            {filteredOrders.length
              ? Math.round(
                  filteredOrders.reduce(
                    (a, b) => a + b.price * b.quantity,
                    0
                  ) / filteredOrders.length
                )
              : 0}
          </h2>
        </div>

      </div>

      {/* Orders Table */}

      <div className="overflow-y-auto h-[48vh] px-6">

        <table className="w-full border-collapse">

          <thead className="sticky top-0 bg-violet-600 text-white">

            <tr>

              <th className="p-4 text-left">Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Region</th>
              <th>Qty</th>
              <th>Price</th>
              <th>Total</th>
              <th>Date</th>

            </tr>

          </thead>

          <tbody>

            {filteredOrders.map((order, index) => (

              <tr
                key={order._id}
                className={`${
                  index % 2 === 0
                    ? "bg-white"
                    : "bg-gray-50"
                } hover:bg-violet-50`}
              >

                <td className="p-4 font-medium">
                  {order.orderId}
                </td>

                <td>{order.customerName}</td>

                <td>{order.productName}</td>

                <td>{order.region}</td>

                <td>

                  <span className="bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full">
                    {order.quantity}
                  </span>

                </td>

                <td>
                  ₹{order.price}
                </td>

                <td className="font-semibold text-green-600">
                  ₹{(order.price * order.quantity).toLocaleString()}
                </td>

                <td>
                  {new Date(order.orderDate).toLocaleDateString()}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Footer */}

      <div className="border-t flex justify-between items-center px-6 py-4">

        <p className="text-gray-500">
          Showing {filteredOrders.length} Orders
        </p>

        <button
          onClick={() => setShowAllOrders(false)}
          className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700"
        >
          Close
        </button>

      </div>

    </div>

  </div>
)}
    </div>
  );
};

export default OrderAnalytics;