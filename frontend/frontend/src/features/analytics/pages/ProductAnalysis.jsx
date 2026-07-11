import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = [
  "#7C3AED", "#06B6D4", "#10B981",
  "#F59E0B", "#EF4444", "#EC4899", "#6366F1",
];

const ProductAnalysis = () => {
 const [dateRange, setDateRange] = useState("today");
  const [productData, setProductData]   = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading]           = useState(false);
const [stats, setStats] = useState({});
const [showAllProducts, setShowAllProducts] = useState(false);
const [search, setSearch] = useState("");
const [sortBy, setSortBy] = useState("soldUnits");
const [allProducts, setAllProducts] = useState([]);

  // ✅ Fetch upload history for dropdown

  // ✅ Fetch top products filtered by uploadId
const fetchTopProducts = async () => {

const endpoint =
`/products/top-products?range=${dateRange}`;

const res = await axiosInstance.get(endpoint);

setProductData(res.data);

};
const fetchCategories = async () => {
  try {
    const endpoint = `/products/categories?range=${dateRange}`;

    const res = await axiosInstance.get(endpoint);

    const formatted = res.data.map((item) => ({
      name: item._id,
      value: item.count,
    }));

    setCategoryData(formatted);
  } catch (error) {
    console.log(error);
  }
};

const fetchAllProducts = async () => {
  try {
    console.log("Calling fetchAllProducts...");

    const endpoint =
`/products/all-products?range=${dateRange}`;

    console.log(endpoint);
    

    const res = await axiosInstance.get(endpoint);
console.log("Products received:", res.data.length);
console.log(res.data);

    setAllProducts(res.data);
    setShowAllProducts(true);
  } catch (error) {
    console.log(error);
  }
};

const fetchDashboardStats = async () => {
  try {
   const endpoint =
`/products/dashboard?range=${dateRange}`;

    const res = await axiosInstance.get(endpoint);

    console.log("PRODUCT STATS:", res.data);

    setStats(res.data);
  } catch (error) {
    console.log(error);
  }
};

  // ✅ Fetch categories filtered by uploadId

useEffect(() => {
  if (showAllProducts) {
    fetchAllProducts();
  }
}, [showAllProducts, dateRange]);

  // ✅ Re-fetch charts when upload selection changes
 useEffect(() => {
  const load = async () => {
    setLoading(true);

    await Promise.all([
      fetchTopProducts(),
      fetchCategories(),
      fetchDashboardStats(),
    ]);

    setLoading(false);
  };

  load();
}, [dateRange]);

  const totalSoldUnits = productData.reduce((sum, item) => sum + item.soldUnits, 0);
  const topProduct = productData.length > 0 ? productData[0].productName : "N/A";

  


const filteredProducts = [...allProducts]
  .filter((product) =>
    product.productName
      ?.toLowerCase()
      .includes(search.toLowerCase())
  )
  .sort((a, b) => {
    switch (sortBy) {
      case "price":
        return b.price - a.price;

      case "rating":
        return b.rating - a.rating;

      case "stock":
        return b.stock - a.stock;

      case "soldUnits":
        return b.soldUnits - a.soldUnits;

      default:
        return 0;
    }
  });
const processedCategoryData = (() => {
  const sorted = [...categoryData].sort(
    (a, b) => b.value - a.value
  );

  const top = sorted.slice(0, 5);

  const others = sorted
    .slice(5)
    .reduce((sum, item) => sum + item.value, 0);

  if (others > 0) {
    top.push({
      name: "Others",
      value: others,
    });
  }

  return top;
})();

  return (
   <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-100 p-4 sm:p-6 lg:p-8">

      <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6">Product Analysis</h1>

      {/* ✅ Dataset Selector */}
     <div className="mb-8 bg-white p-5 rounded-2xl shadow">

  <label className="block mb-2 font-semibold">
    Date Range
  </label>

  <select
    value={dateRange}
    onChange={(e) => setDateRange(e.target.value)}
   className="border rounded-lg p-2 w-full sm:w-72">
    <option value="today">Today</option>
    <option value="yesterday">Yesterday</option>
    <option value="last7days">Last 7 Days</option>
    <option value="last30days">Last 30 Days</option>
    <option value="thisMonth">This Month</option>
    <option value="lastMonth">Last Month</option>
    <option value="last3months">Last 3 Months</option>
    <option value="thisYear">This Year</option>
    <option value="all">All Time</option>
  </select>

</div>

      {/* Cards */}
     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

  <div className="bg-white p-6 rounded-3xl shadow-lg">
    <h3 className="text-slate-500">
      Total Products
    </h3>

    <p className="text-3xl font-bold text-blue-600 mt-2">
      {stats.totalProducts || 0}
    </p>
  </div>
        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-slate-500">Top Product</h3>
          <p className="text-xl lg:text-2xl break-words font-bold text-violet-600 mt-2">{topProduct}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-slate-500">Categories</h3>
          <p className="text-2xl font-bold text-cyan-600 mt-2">{categoryData.length}</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h3 className="text-slate-500">Total Sold Units</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">{totalSoldUnits}</p>
        </div>
     
      </div>

      {/* Charts */}
<div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6 transition-opacity ${loading ? "opacity-40" : "opacity-100"}`}>

        {/* Top Products Bar Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-lg">
         <div className="flex justify-between items-center mb-4">

  <h2 className="text-xl font-semibold">
    Top Selling Products
  </h2>
<p className="text-sm text-slate-500 mt-3">
  Showing {productData.length} of {stats.totalProducts} Products
</p>
<button
    onClick={() => setShowAllProducts(true)}
    className="mt-6 bg-violet-600 hover:bg-violet-700 text-white px-6 py-3 rounded-lg"
>
    View All Products
</button>

</div>
          {productData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No data for selected upload
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={productData}>
               <XAxis
dataKey="productName"
angle={-45}
textAnchor="end"
height={80}
tick={{ fontSize: 10 }}
tickFormatter={(value) =>
  value.length > 10
    ? value.slice(0, 10) + "..."
    : value
}
/>
                <YAxis />
                <Tooltip />
                <Bar dataKey="soldUnits" fill="#7C3AED" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-lg">

  <div className="flex justify-between items-center mb-4">
    <h2 className="text-xl font-semibold">
      Category Distribution
    </h2>

    <span className="text-sm text-slate-500">
      Top Categories
    </span>
  </div>

  {categoryData.length === 0 ? (
    <div className="h-64 flex items-center justify-center text-slate-400">
      No data for selected upload
    </div>
  ) : (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>

        <Pie
          data={processedCategoryData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="42%"
          innerRadius={50}
          outerRadius={80}
          paddingAngle={3}
          label={false}
        >
          {processedCategoryData.map((entry, index) => (
            <Cell
              key={index}
              fill={COLORS[index % COLORS.length]}
            />
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
  )}

</div>

      </div>
     {showAllProducts && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl shadow-2xl w-[98%] sm:w-[95%] max-w-7xl h-[90vh] overflow-hidden">

      {/* Header */}
      <div className="flex justify-between items-center border-b px-8 py-5">

        <div>
          <h2 className="text-3xl font-bold">
            📦 All Products
          </h2>

          <p className="text-gray-500">
            {filteredProducts.length} Products
          </p>
        </div>

        <button
          onClick={() => setShowAllProducts(false)}
          aria-label="Close"
          className="text-3xl leading-none text-gray-400 hover:text-gray-700 transition-colors"
        >
          &times;
        </button>

      </div>

      {/* Search + Sort */}
      <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center items-center p-6 border-b">

        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-full md:w-80"
        />

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-lg px-4 py-2"
        >
          <option value="soldUnits">Top Selling</option>
          <option value="rating">Highest Rating</option>
          <option value="price">Highest Price</option>
          <option value="stock">Highest Stock</option>
        </select>

      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 p-6">

        <div className="bg-violet-50 rounded-xl p-4">
          <p className="text-gray-500">Products</p>
          <h2 className="text-3xl font-bold">
            {filteredProducts.length}
          </h2>
        </div>

        <div className="bg-blue-50 rounded-xl p-4">
          <p className="text-gray-500">Average Price</p>
          <h2 className="text-3xl font-bold">
            ₹
            {filteredProducts.length
              ? Math.round(
                  filteredProducts.reduce((a, b) => a + b.price, 0) /
                    filteredProducts.length
                )
              : 0}
          </h2>
        </div>

        <div className="bg-yellow-50 rounded-xl p-4">
          <p className="text-gray-500">Average Rating</p>
          <h2 className="text-3xl font-bold">
            ⭐
            {filteredProducts.length
              ? (
                  filteredProducts.reduce(
                    (a, b) => a + b.rating,
                    0
                  ) / filteredProducts.length
                ).toFixed(1)
              : 0}
          </h2>
        </div>

        <div className="bg-green-50 rounded-xl p-4">
          <p className="text-gray-500">Total Stock</p>
          <h2 className="text-3xl font-bold">
            {filteredProducts.reduce((a, b) => a + b.stock, 0)}
          </h2>
        </div>

      </div>

      {/* Table */}
      <div className="overflow-x-auto overflow-y-auto h-[48vh] px-6">

        <table className="w-full border-collapse">

          <thead className="sticky top-0 bg-violet-600 text-white">

            <tr>

              <th className="p-4 text-left">Product</th>
              <th>Category</th>
              <th>Brand</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Sold</th>
              <th>Rating</th>

            </tr>

          </thead>

          <tbody>

            {filteredProducts.map((product, index) => (

              <tr
                key={product._id}
                className={`${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-violet-50`}
              >

                <td className="p-4 font-medium">
                  {product.productName}
                </td>

                <td>{product.category}</td>

                <td>{product.brand}</td>

                <td>₹{product.price}</td>

                <td>

                  <span
                    className={`px-3 py-1 rounded-full text-white text-sm

                    ${
                      product.stock > 100
                        ? "bg-green-500"
                        : product.stock > 20
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  >
                    {product.stock}
                  </span>

                </td>

                <td>

                  <span className="bg-violet-100 text-violet-700 px-3 py-1 rounded-full">
                    {product.soldUnits}
                  </span>

                </td>

                <td>⭐ {product.rating}</td>

              </tr>

            ))}

          </tbody>

        </table>

      </div>

      {/* Footer */}
      <div className="border-t flex flex-col sm:flex-row gap-4 sm:justify-between sm:items-center items-center px-6 py-4">

        <p className="text-gray-500">
          Showing {filteredProducts.length} Products
        </p>

  <button
    onClick={() => setShowAllProducts(false)}
    className="bg-violet-600 text-white px-6 py-2 rounded-lg"
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

export default ProductAnalysis;