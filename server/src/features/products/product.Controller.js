import Product from "./Product.js";
import mongoose from "mongoose";
import asyncHandler from "../../utils/asyncHandler.js";

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
        $gte: new Date(
          now.getFullYear(),
          now.getMonth() - 3,
          now.getDate()
        ),
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
export const getTopProducts = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const products = await Product.find(match)
    .sort({ soldUnits: -1 })
    .limit(10);

  res.status(200).json(products);
});

// GET /api/products/categories?range=xxx
export const getCategoryStats = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const stats = await Product.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$category",
        count: { $sum: 1 },
        totalSold: { $sum: "$soldUnits" },
        totalRevenue: {
          $sum: { $multiply: ["$price", "$soldUnits"] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);

  res.status(200).json(stats);
});

// GET /api/products/regions?range=xxx
export const getRegionRevenue = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const stats = await Product.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$region",
        revenue: {
          $sum: { $multiply: ["$price", "$soldUnits"] },
        },
        soldUnits: { $sum: "$soldUnits" },
        totalStock: { $sum: "$stock" },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  res.status(200).json(stats);
});

// GET /api/products/dashboard?range=xxx
export const getDashboardStats = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const stats = await Product.aggregate([
    { $match: match },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalRevenue: {
          $sum: { $multiply: ["$price", "$soldUnits"] },
        },
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

// GET /api/products/ratings?range=xxx
export const getRatingDistribution = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const ratings = await Product.aggregate([
    { $match: match },
    {
      $bucket: {
        groupBy: "$rating",
        boundaries: [0, 1, 2, 3, 4, 5],
        default: "Other",
        output: {
          count: { $sum: 1 },
        },
      },
    },
  ]);

  res.status(200).json(ratings);
});

// GET /api/products/category-distribution?range=xxx
export const getCategoryDistribution = asyncHandler(async (req, res) => {
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

  res.status(200).json(data);
});

// GET /api/products/price-distribution?range=xxx
export const getPriceDistribution = asyncHandler(async (req, res) => {
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

  res.status(200).json(data);
});

// GET /api/products
export const getAllProducts = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const products = await Product.find(match).sort({
    soldUnits: -1,
  });

  res.status(200).json(products);
});