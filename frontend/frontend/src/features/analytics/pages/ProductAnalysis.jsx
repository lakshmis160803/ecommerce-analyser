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
  const [uploads, setUploads]           = useState([]);
  const [selectedUpload, setSelectedUpload] = useState("");
  const [productData, setProductData]   = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [loading, setLoading]           = useState(false);
const [stats, setStats] = useState({});
const [showAllProducts, setShowAllProducts] = useState(false);
const [search, setSearch] = useState("");
const [sortBy, setSortBy] = useState("soldUnits");
const [allProducts, setAllProducts] = useState([]);

  // ✅ Fetch upload history for dropdown
const fetchUploads = async () => {
  try {
    const res = await axiosInstance.get("/upload/uploads");

    const result = Array.isArray(res.data)
      ? res.data
      : res.data.data;

    setUploads(
      result.filter(
        (item) => item.fileType === "product"
      )
    );
  } catch (error) {
    console.log(error);
  }
};
  // ✅ Fetch top products filtered by uploadId
const fetchTopProducts = async (uploadId) => {
  try {
    const endpoint = uploadId
      ? `/products/top-products?uploadId=${uploadId}`
      : "/products/top-products";

    const res = await axiosInstance.get(endpoint);

    setProductData(res.data);
  } catch (error) {
    console.log(error);
  }
};

const fetchCategories = async (uploadId) => {
  try {
    const endpoint = uploadId
      ? `/products/categories?uploadId=${uploadId}`
      : "/products/categories";

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

    const endpoint = selectedUpload
      ? `/products/all-products?uploadId=${selectedUpload}`
      : "/products/all-products";

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

const fetchDashboardStats = async (uploadId) => {
  try {
    const endpoint = uploadId
      ? `/products/dashboard?uploadId=${uploadId}`
      : "/products/dashboard";

    const res = await axiosInstance.get(endpoint);

    console.log("PRODUCT STATS:", res.data);

    setStats(res.data);
  } catch (error) {
    console.log(error);
  }
};

  // ✅ Fetch categories filtered by uploadId

  useEffect(() => {
    fetchUploads();
  }, []);
  useEffect(() => {
  if (showAllProducts) {
    fetchAllProducts();
  }
}, [showAllProducts, selectedUpload]);

  // ✅ Re-fetch charts when upload selection changes
 useEffect(() => {
  const load = async () => {
    setLoading(true);

    await Promise.all([
      fetchTopProducts(selectedUpload),
      fetchCategories(selectedUpload),
      fetchDashboardStats(selectedUpload),
    ]);

    setLoading(false);
  };

  load();
}, [selectedUpload]);

  const totalSoldUnits = productData.reduce((sum, item) => sum + item.soldUnits, 0);
  const topProduct = productData.length > 0 ? productData[0].productName : "N/A";

  const selectedLabel = selectedUpload
    ? uploads.find((u) => u._id === selectedUpload)?.fileName || "Selected Upload"
    : "All Uploads";

const fetchStats = async (uploadId) => {
  try {
    const endpoint = uploadId
      ? `/products/stats?uploadId=${uploadId}`
      : "/products/stats";

    const res = await axiosInstance.get(endpoint);

    setStats(res.data);
  } catch (error) {
    console.log(error);
  }
};
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
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-100 p-8">

      <h1 className="text-4xl font-bold mb-6">Product Analysis</h1>

      {/* ✅ Dataset Selector */}
      <div className="mb-8 bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 flex-wrap">
        <div>
          <label className="block text-sm font-semibold text-slate-500 mb-1">
            Select Dataset
          </label>
          <select
            value={selectedUpload}
            onChange={(e) => setSelectedUpload(e.target.value)}
            className="border p-2 rounded-lg w-72 text-sm"
          >
            <option value="">All Uploads</option>
            {uploads.map((upload) => (
              <option key={upload._id} value={upload._id}>
                {upload.fileName} — {upload.totalRecords} records ({new Date(upload.createdAt).toLocaleDateString()})
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-slate-400 mt-4">
          Showing: <span className="font-medium text-slate-600">{selectedLabel}</span>
        </p>
      </div>

      {/* Cards */}
     <div className="grid md:grid-cols-4 gap-6 mb-8">

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
          <p className="text-2xl font-bold text-violet-600 mt-2">{topProduct}</p>
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
      <div className={`grid lg:grid-cols-2 gap-8 transition-opacity ${loading ? "opacity-40" : "opacity-100"}`}>

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
                <XAxis dataKey="productName" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="soldUnits" fill="#7C3AED" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white p-6 rounded-3xl shadow-lg">
          <h2 className="text-xl font-semibold mb-4">Category Distribution</h2>
          {categoryData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-slate-400">
              No data for selected upload
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={350}>
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" outerRadius={110} label>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

      </div>
     {showAllProducts && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

    <div className="bg-white rounded-2xl shadow-2xl w-[95%] max-w-7xl h-[90vh] overflow-hidden">

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

   

      </div>

      {/* Search + Sort */}
      <div className="flex justify-between items-center p-6 border-b">

        <input
          type="text"
          placeholder="Search product..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded-lg px-4 py-2 w-80"
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
      <div className="grid grid-cols-4 gap-5 p-6">

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
      <div className="overflow-y-auto h-[48vh] px-6">

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
      <div className="border-t flex justify-between items-center px-6 py-4">

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