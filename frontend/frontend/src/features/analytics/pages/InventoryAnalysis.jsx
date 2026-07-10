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
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "#7C3AED",
  "#A855F7",
  "#EC4899",
];

export default function InventoryAnalysis() {
  const [data, setData] = useState(null);
const [showAllOutOfStock, setShowAllOutOfStock] = useState(false);
  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const res = await axiosInstance.get(
        "/inventory/dashboard"
      );

      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  if (!data)
    return (
      <div className="p-10">
        Loading...
      </div>
    );
const displayedOutOfStock = showAllOutOfStock
  ? data.outOfStock
  : data.outOfStock.slice(0, 5);
  const stockStatus = [
    {
      name: "Healthy",
      value:
        data.totalStock -
        data.lowStock.length -
        data.outOfStock.length,
    },
    {
      name: "Low",
      value: data.lowStock.length,
    },
    {
      name: "Out",
      value: data.outOfStock.length,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-100 p-6 lg:p-8">

  <div className="flex justify-between items-center mb-8">
    <div>
      <h1 className="text-4xl font-bold text-slate-800">
        Inventory Analysis
      </h1>
      <p className="text-slate-500 mt-2">
        Monitor inventory health and stock performance
      </p>
    </div>
  </div>

  {/* KPI Cards */}

  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

    <div className="rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 text-white p-6 shadow-lg">
      <p className="text-xl opacity-80">📦 Total Stock</p>
      <h2 className="text-4xl font-bold mt-3">
        {data.totalStock}
      </h2>
    </div>

    <div className="rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 text-white p-6 shadow-lg">
      <p className="text-xl opacity-80">💰 Inventory Value</p>
      <h2 className="text-3xl font-bold mt-3">
        ₹{data.inventoryValue.toLocaleString()}
      </h2>
    </div>

    <div className="rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white p-6 shadow-lg">
      <p className="text-xl opacity-80">⚠ Low Stock</p>
      <h2 className="text-4xl font-bold mt-3">
        {data.lowStock.length}
      </h2>
    </div>

    <div className="rounded-2xl bg-gradient-to-r from-red-500 to-rose-600 text-white p-6 shadow-lg">
      <p className="text-xl opacity-80">⏰ Out Of Stock</p>
      <h2 className="text-4xl font-bold mt-3">
        {data.outOfStock.length}
      </h2>
    </div>

  </div>

  {/* Charts */}

  <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

    {/* Category Chart */}

    <div className="bg-white rounded-2xl shadow-lg p-6">

      <div className="flex justify-between items-center mb-6">

        <div>
          <h2 className="text-xl font-bold">
            Inventory by Category
          </h2>

          <p className="text-sm text-slate-500">
            Stock available across categories
          </p>
        </div>

      </div>

      <ResponsiveContainer width="100%" height={340}>
        <BarChart data={data.inventoryByCategory}>

          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="_id"
            tick={{ fontSize: 12 }}
          />

          <YAxis />

          <Tooltip />

          <Bar
            dataKey="stock"
            radius={[8,8,0,0]}
            fill="#7C3AED"
          />

        </BarChart>
      </ResponsiveContainer>

    </div>

    {/* Stock Status */}

    <div className="bg-white rounded-2xl shadow-lg p-6">

      <div className="mb-6">

        <h2 className="text-xl font-bold">
          Inventory Health
        </h2>

        <p className="text-sm text-slate-500">
          Current stock status
        </p>

      </div>

      <ResponsiveContainer width="100%" height={340}>

        <PieChart>

          <Pie
            data={stockStatus}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={105}
            paddingAngle={4}
          >

            {stockStatus.map((entry, index) => (

              <Cell
                key={index}
                fill={
                  ["#22C55E","#F59E0B","#EF4444"][index]
                }
              />

            ))}

          </Pie>

          <Tooltip />

          <Legend
            verticalAlign="bottom"
            height={36}
          />

        </PieChart>

      </ResponsiveContainer>

    </div>

  </div>


     {/* Inventory Overview */}

<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">

  {/* Low Stock */}

  <div className="bg-white rounded-2xl shadow-lg p-6">

    <div className="flex justify-between items-center mb-5">

      <div>
        <h2 className="text-xl font-bold text-amber-600">
          ⚠️ Low Stock
        </h2>

        <p className="text-sm text-slate-500">
          {data.lowStock.length} Products
        </p>
      </div>

    </div>

    {data.lowStock.length === 0 ? (

      <div className="text-center py-12 text-green-600">
        🎉 All products have sufficient stock.
      </div>

    ) : (

      <div className="space-y-3">

        {data.lowStock.slice(0,5).map((product)=>(

          <div
            key={product._id}
            className="flex justify-between items-center rounded-xl border p-4 hover:bg-amber-50"
          >

            <div>

              <h3 className="font-semibold">
                {product.productName}
              </h3>

              <p className="text-sm text-slate-500">
                {product.category}
              </p>

            </div>

            <div className="text-right">

              <p className="text-amber-600 font-bold">
                {product.stock}
              </p>

              <p className="text-xs text-slate-400">
                Remaining
              </p>

            </div>

          </div>

        ))}

      </div>

    )}

  </div>

  {/* Out Of Stock */}

  <div className="bg-white rounded-2xl shadow-lg p-6">

    <div className="flex justify-between items-center mb-5">

      <div>

        <h2 className="text-xl font-bold text-red-600">
           ⏰ Out Of Stock
        </h2>

        <p className="text-sm text-slate-500">
          {data.outOfStock.length} Products
        </p>

      </div>

      {data.outOfStock.length>5 && (

        <button
          onClick={()=>
            setShowAllOutOfStock(!showAllOutOfStock)
          }
          className="text-violet-600 font-semibold"
        >
          {showAllOutOfStock
            ? "Show Less"
            : `Show All (${data.outOfStock.length})`}
        </button>

      )}

    </div>

    <div className="space-y-3">

      {displayedOutOfStock.length===0 ? (

        <div className="text-center py-12 text-green-600">
          🎉 No products are out of stock.
        </div>

      ) : (

        displayedOutOfStock.map((product)=>(

          <div
            key={product._id}
            className="flex justify-between items-center rounded-xl border p-4 hover:bg-red-50"
          >

            <div>

              <h3 className="font-semibold">
                {product.productName}
              </h3>

              <p className="text-sm text-slate-500">
                {product.category}
              </p>

            </div>

            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
              Out
            </span>

          </div>

        ))

      )}

    </div>

  </div>

</div>

{/* Moving Products */}

<div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mt-8">

  <InventoryTable
    title="🏆 Fast Moving Products"
    products={data.fastMoving.slice(0,5)}
  />

  <InventoryTable
    title="🐢 Slow Moving Products"
    products={data.slowMoving.slice(0,5)}
  />

</div>
</div>
  );
}

function Card({ title, value }) {
  return (
    <div className="bg-white rounded-xl shadow p-6">
      <p className="text-slate-500">
        {title}
      </p>

      <h2 className="text-3xl font-bold mt-2">
        {value}
      </h2>
    </div>
  );
}

function InventoryTable({ title, products }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">
          {title}
        </h2>

        <span className="text-sm text-slate-500">
          Top {products.length}
        </span>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-10 text-slate-500">
          No products found
        </div>
      ) : (
        <div className="space-y-4">

          {products.map((product, index) => {

            const maxSold = products[0]?.soldUnits || 1;
            const progress =
              (product.soldUnits / maxSold) * 100;

            return (
              <div
                key={product._id}
                className="border rounded-xl p-4 hover:shadow-md hover:border-violet-400 transition-all"
              >

                <div className="flex justify-between items-center">

                  <div className="flex items-center gap-4">

                    <div className="w-10 h-10 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold">
                      {index + 1}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-800">
                        {product.productName}
                      </h3>

                      <p className="text-sm text-slate-500">
                        {product.category}
                      </p>
                    </div>

                  </div>

                  <div className="text-right">

                    <p className="text-lg font-bold text-violet-600">
                      {product.soldUnits}
                    </p>

                    <p className="text-xs text-slate-400">
                      Sold Units
                    </p>

                  </div>

                </div>

                <div className="mt-4">

                  <div className="w-full bg-slate-200 rounded-full h-2">

                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-700"
                      style={{
                        width: `${progress}%`,
                      }}
                    />

                  </div>

                </div>

              </div>
            );

          })}

        </div>
      )}

    </div>
  );
}