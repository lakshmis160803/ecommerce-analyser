import { useState, useRef } from "react";

import axiosInstance from "../../../api/axiosInstance";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  FiBarChart2,
  FiPieChart,
  FiShoppingCart,
  FiTrendingUp,
} from "react-icons/fi";

import { BsLaptop, BsBoxSeam } from "react-icons/bs";

// NOTE: Importing server-side code directly into a client bundle is risky.
// If this file (or its dependencies) uses Node-only APIs, your frontend build
// may break, or you may end up shipping server internals to the browser.
// Consider moving fieldMapping.js into a shared package both sides import from.
import {
  autoMapFields,
  autoMapOrderFields,
  detectFileType,
} from "../../../../../../server/src/features/utils/fieldMapping.js";

import { useSelector } from "react-redux";

const EMPTY_PRODUCT = {
  productId: "",
  productName: "",
  category: "",
  brand: "",
  price: "",
  costPrice: "",
  stock: "",
  soldUnits: "",
  rating: "",
  region: "",
};

const UploadData = () => {
  const { user } = useSelector((state) => state.auth);
  const isViewer = user?.role === "viewer";
  const [file, setFile] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [product, setProduct] = useState(EMPTY_PRODUCT);
  const uploadRef = useRef(null);
  const [uploadStatus, setUploadStatus] = useState("idle");
  const [unknownColumns, setUnknownColumns] = useState([]);
  const [unknownMapping, setUnknownMapping] = useState({});
  const [rows, setRows] = useState([]);
  const [fileType, setFileType] = useState("");
  const [showMapping, setShowMapping] = useState(false);
  const [mapping, setMapping] = useState({});

  const buildFinalMapping = () => {
    const finalMapping = { ...mapping };
    Object.entries(unknownMapping).forEach(([column, field]) => {
      if (field !== "nullable") {
        finalMapping[field] = column;
      }
    });
    return finalMapping;
  };

  // Bug fix: prevent two different columns silently overwriting the same
  // target field (e.g. mapping both "Unit Price" and "MSRP" to "price").
  const getDuplicateFieldMappings = () => {
    const seen = {};
    const duplicates = [];
    Object.entries(unknownMapping).forEach(([column, field]) => {
      if (field === "nullable") return;
      if (seen[field]) {
        duplicates.push(field);
      } else {
        seen[field] = column;
      }
    });
    return duplicates;
  };

  const buildPayload = (rows) => {
    const finalMapping = buildFinalMapping();

    let transformedData = [];

    if (fileType === "product") {
      transformedData = rows.map((row) => ({
        productId: row[finalMapping.productId] || "",
        productName: row[finalMapping.productName] || "",
        category: row[finalMapping.category] || "",
        brand: row[finalMapping.brand] || "",
        price: Number(row[finalMapping.price]) || 0,
        costPrice: Number(row[finalMapping.costPrice]) || 0,
        stock: Number(row[finalMapping.stock]) || 0,
        soldUnits: Number(row[finalMapping.soldUnits]) || 0,
        rating: Number(row[finalMapping.rating]) || 0,
        region: row[finalMapping.region] || "",
      }));
    } else {
      transformedData = rows.map((row) => ({
        orderId: row[finalMapping.orderId] || "",
        customerName: row[finalMapping.customerName] || "",
        productName: row[finalMapping.productName] || "",
        quantity: Number(row[finalMapping.quantity]) || 0,
        price: Number(row[finalMapping.price]) || 0,
        region: row[finalMapping.region] || "",
        orderDate: row[finalMapping.orderDate]
          ? new Date(row[finalMapping.orderDate])
          : new Date(),
      }));
    }

    const uploadUrl = fileType === "order" ? "/upload/orders" : "/upload/products";

    return {
      uploadUrl,
      transformedData,
    };
  };

  const uploadMappedData = async () => {
    const duplicates = getDuplicateFieldMappings();
    if (duplicates.length > 0) {
      alert(
        `Multiple columns are mapped to the same field: ${duplicates.join(
          ", "
        )}. Please fix before importing.`
      );
      return;
    }

    try {
      setUploadStatus("uploading");

      const { uploadUrl, transformedData } = buildPayload(rows);

      await sendUpload(uploadUrl, transformedData);

      setShowMapping(false);
      setUnknownColumns([]);
      setUnknownMapping({});
      setRows([]);
      setMapping({});
      setFileType("");
    } catch (err) {
      console.error(err);
      setUploadStatus("error");
    }
  };

  const sendUpload = async (uploadUrl, transformedData) => {
    try {
      await axiosInstance.post(uploadUrl, {
        fileName: file.name,
        data: transformedData,
      });

      setUploadStatus("success");
    } catch (err) {
      setUploadStatus("error");
      throw err;
    }
  };

  const prepareUpload = (data) => {
    if (!data?.length) return;

    const detectedType = detectFileType(data[0]);

    const result =
      detectedType === "order" ? autoMapOrderFields(data[0]) : autoMapFields(data[0]);

    setRows(data);
    setFileType(detectedType);
    setMapping(result.mapping);

    setUnknownColumns(result.unknownColumns || []);
    setUnknownMapping({});

    setShowMapping(true);
    setUploadStatus("idle");
  };

  const handleUpload = async () => {
    if (!file) return;

    const extension = file.name.split(".").pop().toLowerCase();

    try {
      if (extension === "csv") {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              if (!results.data.length) {
                alert("The CSV file appears to be empty.");
                return;
              }
              prepareUpload(results.data);
            } catch (err) {
              console.error(err);
              alert(err.response?.data?.message || "Failed to upload CSV");
            }
          },
          // Bug fix: Papa.parse errors (malformed rows, bad delimiters, etc.)
          // were previously silently ignored.
          error: (err) => {
            console.error(err);
            alert("Failed to parse the CSV file: " + err.message);
          },
        });
      } else if (extension === "xlsx" || extension === "xls") {
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            // Bug fix: readAsBinaryString is deprecated and can behave
            // inconsistently. Use ArrayBuffer + type "array" instead.
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, {
              type: "array",
              cellDates: true,
            });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            if (!jsonData.length) {
              alert("The Excel file appears to be empty.");
              return;
            }

            prepareUpload(jsonData);
          } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Failed to upload Excel file");
          }
        };

        reader.onerror = () => {
          alert("Failed to read the file.");
        };

        reader.readAsArrayBuffer(file);
      } else {
        alert("Unsupported file type. Please upload a CSV or Excel file.");
      }
    } catch (err) {
      console.error(err);
      alert("Something went wrong while uploading.");
    }
  };

  const handleManualUpload = async () => {
    try {
      await axiosInstance.post("/products", {
        productId: product.productId,
        productName: product.productName,
        category: product.category,
        brand: product.brand,
        price: Number(product.price) || 0,
        costPrice: Number(product.costPrice) || 0,
        stock: Number(product.stock) || 0,
        soldUnits: Number(product.soldUnits) || 0,
        rating: Number(product.rating) || 0,
        region: product.region,
      });

      alert("Product Added Successfully");
      setProduct(EMPTY_PRODUCT);
      setShowForm(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to Add Product");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-100 p-10 relative overflow-hidden">
      {/* Background Icons */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <FiShoppingCart className="absolute left-10 bottom-20 text-violet-300 opacity-20" size={220} />
        <FiTrendingUp className="absolute left-24 top-40 text-violet-300 opacity-20" size={130} />
        <FiPieChart className="absolute left-40 top-20 text-violet-300 opacity-20" size={90} />
        <BsLaptop className="absolute right-10 bottom-20 text-violet-300 opacity-20" size={280} />
        <FiBarChart2 className="absolute right-32 top-20 text-violet-300 opacity-20" size={120} />
        <BsBoxSeam className="absolute right-20 bottom-52 text-violet-300 opacity-20" size={100} />
      </div>

      {/* Decorative Blobs */}
      <div className="absolute top-20 right-20 w-8 h-8 bg-violet-300 rounded-full opacity-40"></div>
      <div className="absolute bottom-20 left-20 w-40 h-40 bg-violet-200 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-10 right-10 w-64 h-64 bg-purple-200 rounded-full blur-3xl opacity-20"></div>

      {/* Main Content */}
      <div className="relative z-10 flex justify-center">
        <div className="bg-white w-full max-w-5xl rounded-3xl shadow-xl p-8">
          <h1 className="text-4xl font-bold mb-3">Product Data Management</h1>

          <button
            onClick={() => !isViewer && setShowForm(!showForm)}
            disabled={isViewer}
            className={`px-6 py-3 rounded-xl mb-8 text-white ${
              isViewer ? "bg-gray-400 cursor-not-allowed" : "bg-green-500 hover:bg-green-600"
            }`}
          >
            Add Product Manually
          </button>

          {uploadStatus === "success" ? (
            <div className="border-2 border-green-200 bg-green-50 rounded-3xl p-10 text-center">
              <div className="text-6xl mb-4">✅</div>

              <h2 className="text-3xl font-bold text-green-700">Dataset Uploaded Successfully</h2>

              <p className="mt-3 text-gray-600">{file?.name}</p>

              <button
                className="mt-8 px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700"
                onClick={() => {
                  setUnknownColumns([]);
                  setUnknownMapping({});
                  setRows([]);
                  setMapping({});
                  setShowMapping(false);
                  setFile(null);
                  setUploadStatus("idle");

                  setTimeout(() => {
                    uploadRef.current?.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                    });
                  }, 100);
                }}
              >
                Upload Another File
              </button>
            </div>
          ) : (
            <div ref={uploadRef}>
              <label className="border-2 border-dashed border-violet-300 rounded-3xl h-72 flex flex-col items-center justify-center cursor-pointer hover:bg-violet-50 transition">
                <div className="w-20 h-20 rounded-full bg-violet-600 flex items-center justify-center text-white text-4xl mb-4">
                  📊
                </div>

                <h2 className="text-3xl font-bold">Upload CSV / Excel</h2>

                <p className="text-slate-500 mt-2">CSV, XLSX, XLS Supported</p>

                <input
                  type="file"
                  className="hidden"
                  accept=".csv,.xlsx,.xls"
                  disabled={isViewer}
                  onChange={(e) => {
                    const selectedFile = e.target.files?.[0];

                    if (!selectedFile) return;

                    setFile(selectedFile);
                    setUploadStatus("idle");

                    setShowMapping(false);
                    setUnknownColumns([]);
                    setUnknownMapping({});
                    setRows([]);
                    setMapping({});
                    setFileType("");

                    // Bug fix: clear the input value so selecting the same
                    // filename again still fires onChange.
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          )}

          {file && (
            <div className="mt-5 border rounded-xl p-4 bg-slate-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{file.name}</h3>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                </div>

                {uploadStatus === "idle" && <span className="text-yellow-600 font-semibold">🟡 Ready</span>}
                {uploadStatus === "uploading" && (
                  <span className="text-blue-600 font-semibold">🔄 Uploading...</span>
                )}
                {uploadStatus === "success" && <span className="text-green-600 font-semibold">✅ Uploaded</span>}
                {uploadStatus === "error" && <span className="text-red-600 font-semibold">❌ Failed</span>}
              </div>
            </div>
          )}

          {showMapping && (
            <div className="mt-6 rounded-xl border border-violet-200 bg-violet-50 p-4">
              <h3 className="font-semibold text-violet-700">Dataset Analysis</h3>

              <p className="mt-2">
                <strong>Detected Type:</strong>{" "}
                {fileType === "product" ? "📦 Product Dataset" : "🛒 Order Dataset"}
              </p>

              <p className="text-sm text-gray-600 mt-2">
                Known fields were mapped automatically. Review any unknown columns below before importing.
              </p>
            </div>
          )}

          {showMapping && (
            <>
              {unknownColumns.length > 0 ? (
                <div className="mt-6 border rounded-xl p-4 bg-yellow-50 border-yellow-300">
                  <h3 className="text-lg font-semibold mb-4 text-yellow-800">Unknown Columns</h3>

                  <p className="text-sm text-gray-600 mb-4">
                    These columns couldn't be mapped automatically. You can ignore them (Nullable) or map them
                    manually.
                  </p>

                  {unknownColumns.map((column) => (
                    <div key={column} className="flex items-center justify-between mb-3">
                      <span className="font-medium">{column}</span>

                      <select
                        value={unknownMapping[column] || "nullable"}
                        onChange={(e) =>
                          setUnknownMapping((prev) => ({
                            ...prev,
                            [column]: e.target.value,
                          }))
                        }
                        className="border rounded-lg px-3 py-2"
                      >
                        <option value="nullable">Nullable (Ignore)</option>

                        {fileType === "product" ? (
                          <>
                            <option value="productId">Product ID</option>
                            <option value="productName">Product Name</option>
                            <option value="category">Category</option>
                            <option value="brand">Brand</option>
                            <option value="price">Price</option>
                            <option value="costPrice">Cost Price</option>
                            <option value="stock">Stock</option>
                            <option value="soldUnits">Sold Units</option>
                            <option value="rating">Rating</option>
                            <option value="region">Region</option>
                          </>
                        ) : (
                          <>
                            <option value="orderId">Order ID</option>
                            <option value="customerName">Customer Name</option>
                            <option value="productName">Product Name</option>
                            <option value="quantity">Quantity</option>
                            <option value="price">Price</option>
                            <option value="region">Region</option>
                            <option value="orderDate">Order Date</option>
                          </>
                        )}
                      </select>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-green-200 bg-green-50 p-4">
                  <h3 className="text-lg font-semibold text-green-700">✅ Analysis Complete</h3>

                  <p className="text-green-600 mt-2">
                    All columns were mapped successfully. No unknown fields were detected.
                  </p>
                </div>
              )}
            </>
          )}

          <button
            onClick={showMapping ? uploadMappedData : handleUpload}
            disabled={isViewer || uploadStatus === "uploading" || uploadStatus === "success"}
            className={`w-full mt-6 py-4 rounded-xl font-semibold text-white ${
              uploadStatus === "success"
                ? "bg-green-600 cursor-default"
                : isViewer
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-violet-600 to-purple-500"
            }`}
          >
            {uploadStatus === "idle" && (showMapping ? "Import Dataset" : "Analyze Dataset")}

            {uploadStatus === "uploading" && (
              <div className="flex items-center justify-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Uploading...
              </div>
            )}

            {uploadStatus === "success" && "✓ Uploaded Successfully"}

            {uploadStatus === "error" && "Retry Upload"}
          </button>

          {/* Manual Product Form */}
          {showForm && (
            <div className="mt-10 border-t pt-8">
              <h2 className="text-2xl font-bold mb-6">Add Product Manually</h2>

              <div className="grid md:grid-cols-2 gap-4">
                {Object.keys(product).map((key) => (
                  <input
                    key={key}
                    type={
                      ["price", "costPrice", "stock", "soldUnits", "rating"].includes(key) ? "number" : "text"
                    }
                    placeholder={key}
                    value={product[key]}
                    onChange={(e) =>
                      setProduct({
                        ...product,
                        [key]: e.target.value,
                      })
                    }
                    className="border p-3 rounded-xl"
                  />
                ))}
              </div>
              <button
                onClick={handleManualUpload}
                disabled={isViewer || uploadStatus === "uploading"}
                className={`mt-6 px-8 py-3 rounded-xl text-white ${
                  isViewer ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
                }`}
              >
                Save Product
              </button>
              {isViewer && (
                <div className="mb-6 rounded-lg bg-yellow-100 border border-yellow-300 p-4 text-yellow-800">
                  You have Viewer access. Uploading and manually adding products are disabled. Contact a Super
                  Admin if you need Admin permissions.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadData;