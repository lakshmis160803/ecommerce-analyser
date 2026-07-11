import Product from "./Product.js";
import mongoose from "mongoose";
import { createProductSchema } from "../validations/product.validation.js";

// Bug fix: previously every query filtered by `uploadId: { $in: uploadIds }`,
// where uploadIds only ever came from UploadHistory (i.e. CSV/Excel imports).
// Manually created products never get an uploadId, so they silently failed
// to match this filter and never appeared in any analysis endpoint.
//
// Fix: filter directly on the product's own `createdAt` (it already has
// `timestamps: true`) instead of going through UploadHistory. This treats
// manually added and bulk-uploaded products identically.
const getDateFilter = (range) => {
  const now = new Date();

  switch (range) {
    case "today":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      };

    case "yesterday":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      };

    case "last7days":
      return {
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      };

    case "last30days":
      return {
        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };

    case "thisMonth":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      };

    case "lastMonth":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        $lt: new Date(now.getFullYear(), now.getMonth(), 1),
      };

    case "last3months":
      return {
        $gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      };

    case "thisYear":
      return {
        $gte: new Date(now.getFullYear(), 0, 1),
      };

    case "all":
    default:
      return null;
  }
};

const buildMatch = (req) => {
  const match = {
    userId: new mongoose.Types.ObjectId(req.user.id),
  };

  const dateFilter = getDateFilter(req.query.range);
  if (dateFilter) {
    match.createdAt = dateFilter;
  }

  return match;
};

// GET /api/products/top-products?range=xxx
export const getTopProducts = async (req, res) => {
  try {
    const match = buildMatch(req);

    const products = await Product.find(match)
      .sort({ soldUnits: -1 })
      .limit(10);

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/categories?range=xxx
export const getCategoryStats = async (req, res) => {
  try {
    const match = buildMatch(req);

    const stats = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalSold: { $sum: "$soldUnits" },
          totalRevenue: { $sum: { $multiply: ["$price", "$soldUnits"] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/regions?range=xxx
export const getRegionRevenue = async (req, res) => {
  try {
    const match = buildMatch(req);

    const stats = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$region",
          revenue: { $sum: { $multiply: ["$price", "$soldUnits"] } },
          soldUnits: { $sum: "$soldUnits" },
          totalStock: { $sum: "$stock" },
        },
      },
      { $sort: { revenue: -1 } },
    ]);

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/products/dashboard?range=xxx
export const getDashboardStats = async (req, res) => {
  try {
    const match = buildMatch(req);

    const stats = await Product.aggregate([
      { $match: match },
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
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

export const getRatingDistribution = async (req, res) => {
  try {
    const match = buildMatch(req);

    const ratings = await Product.aggregate([
      { $match: match },
      {
        $bucket: {
          groupBy: "$rating",
          boundaries: [0, 1, 2, 3, 4, 5],
          default: "Other",
          output: { count: { $sum: 1 } },
        },
      },
    ]);

    res.status(200).json(ratings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getCategoryDistribution = async (req, res) => {
  try {
    const match = buildMatch(req);

    const data = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getPriceDistribution = async (req, res) => {
  try {
    const match = buildMatch(req);

    const data = await Product.aggregate([
      { $match: match },
      {
        $project: {
          _id: 0,
          productName: 1,
          price: 1,
        },
      },
      { $sort: { price: 1 } },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/products
export const createProduct = async (req, res) => {
  try {
    const validatedData = createProductSchema.parse(req.body);

    const product = await Product.create({
      ...validatedData,
      userId: req.user.id,
    });

    res.status(201).json({
      success: true,
      product,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      errors: err.errors,
    });
  }
};

export const getAllProducts = async (req, res) => {
  try {
    const match = buildMatch(req);

    const products = await Product.find(match).sort({ soldUnits: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};