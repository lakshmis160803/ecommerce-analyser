import Product from "../products/Product.js";
import UploadHistory from "./UploadHistory.js";
import mongoose from "mongoose";

export const uploadProducts = async (req, res) => {
  try {
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
      totalRecords: data.length,
      uploadedBy: req.user.id,
    });

    const products = data.map((product) => ({
      ...product,
      uploadId: upload._id,
      userId: req.user.id,
    }));

    await Product.insertMany(products);

    res.status(200).json({
      success: true,
      uploadId: upload._id,
      totalRecords: data.length,
    });
  } catch (error) {
    console.error("uploadProducts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUploads = async (req, res) => {
  try {
const uploads = await UploadHistory.find({
  fileType: "product",
  uploadedBy: req.user.id,
}).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: uploads });
  } catch (error) {
    console.error("getUploads error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDashboardStats = async (req, res) => {
  try {
    const { uploadId } = req.params;

 const matchFilter = {
  userId: new mongoose.Types.ObjectId(req.user.id),

  ...(uploadId &&
  mongoose.Types.ObjectId.isValid(uploadId)
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
          totalProducts:  { $sum: 1 },
          totalRevenue:   { $sum: { $multiply: ["$price", "$soldUnits"] } },
          totalStock:     { $sum: "$stock" },
          totalSoldUnits: { $sum: "$soldUnits" },
          avgRating:      { $avg: "$rating" },
        },
      },
    ]);

    if (!stats.length) {
      return res.status(200).json({
        totalProducts: 0, totalRevenue: 0, totalStock: 0, totalSoldUnits: 0, avgRating: 0,
      });
    }

    const { _id, ...result } = stats[0];
    res.status(200).json(result);
  } catch (error) {
    console.error("getDashboardStats error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addProduct = async (req, res) => {
  try {
    const {
      productId, productName, category, brand,
      price, costPrice, stock, soldUnits, rating, region,
    } = req.body;

    if (!productId || !productName) {
      return res.status(400).json({ success: false, message: "productId and productName are required." });
    }

    if (rating !== undefined && (Number(rating) < 0 || Number(rating) > 5)) {
      return res.status(400).json({ success: false, message: "Rating must be between 0 and 5." });
    }

    const product = await Product.create({
      productId, productName,
      category: category || "",
      brand: brand || "",
      price: Number(price) || 0,
      costPrice: Number(costPrice) || 0,
      stock: Number(stock) || 0,
      soldUnits: Number(soldUnits) || 0,
      rating: Number(rating) || 0,
      region: region || "",
      userId: req.user.id,
    });

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    console.error("addProduct error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};