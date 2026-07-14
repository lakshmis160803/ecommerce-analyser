import Product from "../products/Product.js";
import UploadHistory from "./UploadHistory.js";
import Customer from "../customers/Customer.js";
import mongoose from "mongoose";
import asyncHandler from "../../middleware/asyncHandler.js"
import { sendToUser } from "../notifications/notificationManager.js"; // adjust path to match your project

const LOW_STOCK_THRESHOLD = 20;

// Checks a single product's stock and pushes an SSE alert to the owning
// user if it's low or out of stock. Call this right after any create/insert
// that sets a product's stock value.
const checkAndNotifyStock = (userId, product) => {
  if (product.stock === 0) {
    sendToUser(
      userId,
      {
        type: "OUT_OF_STOCK",
        productId: product.productId,
        productName: product.productName,
        message: `${product.productName} is now out of stock.`,
      },
      "stock-alert"
    );
  } else if (product.stock < LOW_STOCK_THRESHOLD) {
    sendToUser(
      userId,
      {
        type: "LOW_STOCK",
        productId: product.productId,
        productName: product.productName,
        stock: product.stock,
        message: `${product.productName} is running low (${product.stock} left).`,
      },
      "stock-alert"
    );
  }
};

export const uploadProducts = asyncHandler(async (req, res) => {
  const { fileName, data } = req.body;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No product data provided.",
    });
  }

  const resolvedFileName = fileName || "unknown_file";

  const upload = await UploadHistory.create({
    fileName: resolvedFileName,
    fileType: "product", // matches what this function actually saves
    totalRecords: data.length,
    uploadedBy: req.user.id,
  });

  const products = data.map((product) => ({
    ...product,
    uploadId: upload._id,
    userId: req.user.id,
  }));

  const inserted = await Product.insertMany(products);

  // Notify for any bulk-imported product that's already low/out of stock
  inserted
    .filter((p) => p.stock === 0 || p.stock < LOW_STOCK_THRESHOLD)
    .forEach((p) => checkAndNotifyStock(req.user.id, p));

  res.status(200).json({
    success: true,
    uploadId: upload._id,
    totalRecords: data.length,
  });
});

export const getUploads = asyncHandler(async (req, res) => {
  const { fileType } = req.query;

  const filter = { uploadedBy: req.user.id };
  if (fileType) filter.fileType = fileType;

  const uploads = await UploadHistory.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: uploads });
});

export const getDashboardStats = asyncHandler(async (req, res) => {
  const { uploadId } = req.query;

  const matchFilter = {
    userId: new mongoose.Types.ObjectId(req.user.id),

    ...(uploadId && mongoose.Types.ObjectId.isValid(uploadId)
      ? {
          uploadId: new mongoose.Types.ObjectId(uploadId),
        }
      : {}),
  };

  const stats = await Product.aggregate([
    { $match: matchFilter },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalRevenue: { $sum: { $multiply: ["$price", "$soldUnits"] } },
        totalStock: { $sum: "$stock" },
        totalSoldUnits: { $sum: "$soldUnits" },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  if (!stats.length) {
    return res.status(200).json({
      totalProducts: 0,
      totalRevenue: 0,
      totalStock: 0,
      totalSoldUnits: 0,
      avgRating: 0,
    });
  }

  const { _id, ...result } = stats[0];
  res.status(200).json(result);
});

export const addProduct = asyncHandler(async (req, res) => {
  const {
    productId,
    productName,
    category,
    brand,
    price,
    costPrice,
    stock,
    soldUnits,
    rating,
    region,
  } = req.body;

  if (!productId || !productName) {
    return res.status(400).json({
      success: false,
      message: "productId and productName are required.",
    });
  }

  if (rating !== undefined && (Number(rating) < 0 || Number(rating) > 5)) {
    return res.status(400).json({
      success: false,
      message: "Rating must be between 0 and 5.",
    });
  }

  // Fix: manually added products previously had no uploadId at all,
  // so they were invisible to any query that filters by uploadId
  // (top-products, dashboard, all-products, etc.). Creating a matching
  // UploadHistory record — same as uploadProducts does for CSV/Excel
  // imports — keeps both code paths consistent.
  const upload = await UploadHistory.create({
    fileName: "Manual Entry",
    fileType: "product",
    totalRecords: 1,
    uploadedBy: req.user.id,
  });

  const product = await Product.create({
    productId,
    productName,
    category: category || "",
    brand: brand || "",
    price: Number(price) || 0,
    costPrice: Number(costPrice) || 0,
    stock: Number(stock) || 0,
    soldUnits: Number(soldUnits) || 0,
    rating: Number(rating) || 0,
    region: region || "",
    uploadId: upload._id,
    userId: req.user.id,
  });

  checkAndNotifyStock(req.user.id, product);

  res.status(201).json({ success: true, data: product });
});

export const uploadCustomers = asyncHandler(async (req, res) => {
  const { fileName, data } = req.body;

  if (!data || !Array.isArray(data) || data.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No customer data provided.",
    });
  }

  const upload = await UploadHistory.create({
    fileName,
    fileType: "customer", // or "order" — whichever your report logic expects
    totalRecords: data.length,
    uploadedBy: req.user.id,
  });

  const customers = data.map((c) => ({
    ...c,
    uploadId: upload._id,
    uploadedBy: req.user.id,
  }));

  await Customer.insertMany(customers);

  res.status(200).json({
    success: true,
    uploadId: upload._id,
    totalRecords: data.length,
  });
});