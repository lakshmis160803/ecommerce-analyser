import mongoose from "mongoose";
import Order from "../orders/Order.js";
import asyncHandler from "../../middleware/asyncHandler.js";

const buildMatch = (req) => ({
  userId: new mongoose.Types.ObjectId(req.user.id),
});

export const getRegionalDashboard = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const regions = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$region",
        revenue: {
          $sum: {
            $multiply: ["$price", "$quantity"],
          },
        },
        orders: { $sum: 1 },
      },
    },
    {
      $sort: {
        revenue: -1,
      },
    },
  ]);

  const totalRegions = regions.length;

  const totalRevenue = regions.reduce(
    (sum, region) => sum + region.revenue,
    0
  );

  const highestRevenueRegion =
    regions.length > 0 ? regions[0]._id : "-";

  const highestOrdersRegion =
    [...regions].sort((a, b) => b.orders - a.orders)[0]?._id || "-";

  res.json({
    totalRegions,
    totalRevenue,
    highestRevenueRegion,
    highestOrdersRegion,
  });
});

export const getRevenueByRegion = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const data = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$region",
        revenue: {
          $sum: {
            $multiply: ["$price", "$quantity"],
          },
        },
      },
    },
    {
      $sort: {
        revenue: -1,
      },
    },
  ]);

  res.json(data);
});

export const getOrdersByRegion = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const data = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$region",
        orders: {
          $sum: 1,
        },
      },
    },
    {
      $sort: {
        orders: -1,
      },
    },
  ]);

  res.json(data);
});

export const getQuantityByRegion = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const data = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$region",
        quantity: {
          $sum: "$quantity",
        },
      },
    },
    {
      $sort: {
        quantity: -1,
      },
    },
  ]);

  res.json(data);
});

export const getRegionalTable = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const data = await Order.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$region",
        orders: {
          $sum: 1,
        },
        quantity: {
          $sum: "$quantity",
        },
        revenue: {
          $sum: {
            $multiply: ["$price", "$quantity"],
          },
        },
      },
    },
    {
      $sort: {
        revenue: -1,
      },
    },
  ]);

  res.json(data);
});