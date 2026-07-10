import { useEffect, useState } from "react";
import axiosInstance from "../../../api/axiosInstance";

const Reports = () => {
  const [uploads, setUploads] = useState([]);
  const [selectedUpload, setSelectedUpload] = useState("");

  const [reportType, setReportType] = useState("sales");

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [report, setReport] = useState({
    totalRevenue: 0,
    totalProducts: 0,
    totalStock: 0,
    totalSoldUnits: 0,
    rows: [],
  });

useEffect(() => {
  fetchUploads();
}, []); // fetch once, not tied to reportType

const fetchUploads = async () => {
  try {
    // no fileType param -> get everything (product + order/customer uploads)
    const res = await axiosInstance.get("/upload/uploads");
    const data = Array.isArray(res.data) ? res.data : res.data.data;
    setUploads(data);
  } catch (err) {
    console.log(err);
  }
};

// derive the fileType of whatever is currently selected
const selectedFileType = selectedUpload
  ? uploads.find((u) => u._id === selectedUpload)?.fileType
  : null;

// which report types make sense for the current selection
const availableReportTypes = !selectedUpload
  ? ["sales", "inventory", "products", "customers"] // "All Uploads" -> allow everything
  : selectedFileType === "order" || selectedFileType === "customer"
  ? ["customers"]
  : ["sales", "inventory", "products"];

// whenever dataset changes, snap reportType to something valid for it
useEffect(() => {
  if (!availableReportTypes.includes(reportType)) {
    setReportType(availableReportTypes[0]);
  }
}, [selectedUpload]); // eslint-disable-line

  const generateReport = async () => {
    try {
      const res = await axiosInstance.get("/reports", {
        params: {
          uploadId: selectedUpload,
          reportType,
          from: fromDate,
          to: toDate,
        },
      });

      setReport(res.data);
    } catch (err) {
      console.log(err);
    }
  };

const exportCSV = () => {
  window.open(
    `http://localhost:5000/api/reports/export/csv?uploadId=${selectedUpload}`
  );
};

const exportExcel = () => {
  window.open(
    `http://localhost:5000/api/reports/export/excel?uploadId=${selectedUpload}`
  );
};

  const downloadInsights = () => {
  window.open(
    `http://localhost:5000/api/reports/insights?uploadId=${selectedUpload}`
  );
};

  return (
    <div className="min-h-screen bg-slate-100 p-6">

      <div className="bg-white rounded-xl shadow p-8">

        <h1 className="text-3xl font-bold mb-8">
          Reports
        </h1>

        {/* Filters */}

        <div className="grid md:grid-cols-4 gap-5">

          <div>
            <label className="font-semibold block mb-2">
              Dataset
            </label>

            <select
  className="border rounded-lg p-3 w-full"
  value={selectedUpload}
  onChange={(e) => setSelectedUpload(e.target.value)}
>
  <option value="">All Uploads</option>

  {uploads.map((upload) => (
    <option key={upload._id} value={upload._id}>
      {upload.fileName} ({upload.fileType})
    </option>
  ))}
</select>
          </div>

          <div>
            <label className="font-semibold block mb-2">
              Report Type
            </label>

            <select
  className="border rounded-lg p-3 w-full"
  value={reportType}
  onChange={(e) => setReportType(e.target.value)}
>
  {availableReportTypes.includes("sales") && (
    <option value="sales">Sales Report</option>
  )}
  {availableReportTypes.includes("inventory") && (
    <option value="inventory">Inventory Report</option>
  )}
  {availableReportTypes.includes("products") && (
    <option value="products">Product Report</option>
  )}
  {availableReportTypes.includes("customers") && (
    <option value="customers">Customer Report</option>
  )}
</select>
          </div>

          <div>
            <label className="font-semibold block mb-2">
              From
            </label>

            <input
              type="date"
              value={fromDate}
              onChange={(e) =>
                setFromDate(e.target.value)
              }
              className="border rounded-lg p-3 w-full"
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">
              To
            </label>

            <input
              type="date"
              value={toDate}
              onChange={(e) =>
                setToDate(e.target.value)
              }
              className="border rounded-lg p-3 w-full"
            />
          </div>

        </div>

        <button
          onClick={generateReport}
          className="mt-6 bg-violet-600 text-white px-6 py-3 rounded-lg"
        >
          Generate Report
        </button>

       {/* KPI */}

{reportType !== "customers" && (
  <div className="grid md:grid-cols-4 gap-6 mt-8">

    <div className="bg-violet-100 rounded-xl p-6">
      <h3>Total Revenue</h3>
      <p className="text-3xl font-bold mt-2">
        ₹{report.totalRevenue}
      </p>
    </div>

    <div className="bg-blue-100 rounded-xl p-6">
      <h3>Total Products</h3>
      <p className="text-3xl font-bold mt-2">
        {report.totalProducts}
      </p>
    </div>

    <div className="bg-green-100 rounded-xl p-6">
      <h3>Total Stock</h3>
      <p className="text-3xl font-bold mt-2">
        {report.totalStock}
      </p>
    </div>

    <div className="bg-orange-100 rounded-xl p-6">
      <h3>Sold Units</h3>
      <p className="text-3xl font-bold mt-2">
        {report.totalSoldUnits}
      </p>
    </div>

  </div>
)}

        {/* Table */}

        <div className="mt-10 overflow-x-auto">

          <table className="w-full">

           <thead className="bg-slate-100">
  {reportType === "sales" && (
    <tr>
      <th className="p-3 text-left">Product</th>
      <th className="p-3 text-left">Category</th>
      <th className="p-3 text-left">Price</th>
      <th className="p-3 text-left">Sold Units</th>
      <th className="p-3 text-left">Revenue</th>
    </tr>
  )}

  {reportType === "inventory" && (
    <tr>
      <th className="p-3 text-left">Product</th>
      <th className="p-3 text-left">Category</th>
      <th className="p-3 text-left">Stock</th>
      <th className="p-3 text-left">Region</th>
    </tr>
  )}

  {reportType === "products" && (
    <tr>
      <th className="p-3 text-left">Product</th>
      <th className="p-3 text-left">Brand</th>
      <th className="p-3 text-left">Category</th>
      <th className="p-3 text-left">Price</th>
      <th className="p-3 text-left">Rating</th>
    </tr>
  )}

  {reportType === "customers" && (
    <tr>
      <th className="p-3 text-left">Customer Name</th>
      <th className="p-3 text-left">Email</th>
      <th className="p-3 text-left">Orders</th>
      <th className="p-3 text-left">Total Spent</th>
      <th className="p-3 text-left">Region</th>
      <th className="p-3 text-left">Customer Type</th>
    </tr>
  )}
</thead>

            <tbody>
  {report.rows?.map((item) => {
    if (reportType === "sales") {
      return (
        <tr key={item._id} className="border-b">
          <td className="p-3">{item.productName}</td>
          <td className="p-3">{item.category}</td>
          <td className="p-3">₹{item.price}</td>
          <td className="p-3">{item.soldUnits}</td>
          <td className="p-3">₹{item.price * item.soldUnits}</td>
        </tr>
      );
    }

    if (reportType === "inventory") {
      return (
        <tr key={item._id} className="border-b">
          <td className="p-3">{item.productName}</td>
          <td className="p-3">{item.category}</td>
          <td className="p-3">{item.stock}</td>
          <td className="p-3">{item.region}</td>
        </tr>
      );
    }

    if (reportType === "products") {
      return (
        <tr key={item._id} className="border-b">
          <td className="p-3">{item.productName}</td>
          <td className="p-3">{item.brand}</td>
          <td className="p-3">{item.category}</td>
          <td className="p-3">₹{item.price}</td>
          <td className="p-3">{item.rating}</td>
        </tr>
      );
    }

    if (reportType === "customers") {
      return (
        <tr key={item._id} className="border-b">
          <td className="p-3">{item.customerName}</td>
          <td className="p-3">{item.customerEmail}</td>
          <td className="p-3">{item.totalOrders}</td>
          <td className="p-3">₹{item.totalSpent}</td>
          <td className="p-3">{item.region}</td>
          <td className="p-3">{item.customerType}</td>
        </tr>
      );
    }

    return null;
  })}
</tbody>
          </table>

        </div>

        {/* Export Buttons */}

        <div className="flex flex-wrap gap-4 mt-10">

          <button
            onClick={exportCSV}
            className="bg-green-600 text-white px-5 py-3 rounded-lg"
          >
            Export CSV
          </button>

          <button
            onClick={exportExcel}
            className="bg-blue-600 text-white px-5 py-3 rounded-lg"
          >
            Export Excel
          </button>

          <button
            onClick={downloadInsights}
            className="bg-violet-600 text-white px-5 py-3 rounded-lg"
          >
            Download Insights
          </button>

        </div>

      </div>

    </div>
  );
};

export default Reports;