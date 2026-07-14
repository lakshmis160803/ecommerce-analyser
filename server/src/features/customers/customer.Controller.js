import Order from "../orders/Order.js";
import Customer from "./Customer.js";
import UploadHistory from "../imports/UploadHistory.js";
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js"; // adjust path to match your project

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

    case "7days":
    case "last7days":
      return {
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      };

    case "30days":
    case "last30days":
      return {
        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };

    case "90days":
    case "last90days":
      return {
        $gte: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
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

    case "365days":
    case "lastyear":
      return {
        $gte: new Date(now.getFullYear() - 1, now.getMonth(), now.getDate()),
      };

    case "all":
    default:
      return null;
  }
};

const buildMatch = (req) => {
  const match = {
    uploadedBy: new mongoose.Types.ObjectId(req.user.id),
  };

  const dateFilter = getDateFilter(req.query.range);
  if (dateFilter) {
    match.createdAt = dateFilter;
  }

  return match;
};

export const getUploads = asyncHandler(async (req, res) => {
  const { fileType } = req.query;

  const filter = { uploadedBy: req.user.id };
  if (fileType) filter.fileType = fileType;

  const uploads = await UploadHistory.find(filter).sort({ createdAt: -1 });
  res.status(200).json({ success: true, data: uploads });
});

// ===============================
// Dashboard KPIs
// ===============================
export const getCustomerDashboard = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const customers = await Customer.find(match);

  const totalCustomers = customers.length;

  const repeatCustomers = customers.filter((c) => c.totalOrders > 1).length;

  const premiumCustomers = customers.filter(
    (c) => c.customerType === "Premium"
  ).length;

  const averageSpend =
    totalCustomers > 0
      ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / totalCustomers
      : 0;

  res.json({
    totalCustomers,
    repeatCustomers,
    premiumCustomers,
    averageSpend,
  });
});

// ===============================
// Top Customers
// ===============================
export const getTopCustomers = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const customers = await Customer.find(match)
    .sort({ totalSpent: -1 })
    .limit(10);

  const data = customers.map((c) => ({
    _id: c.customerName,
    revenue: c.totalSpent,
    orders: c.totalOrders,
  }));

  res.json(data);
});

export const getCustomerGrowth = asyncHandler(async (req, res) => {
  const match = {
    ...buildMatch(req),
    firstOrderDate: {
      $exists: true,
      $ne: null,
    },
  };

  const data = await Customer.aggregate([
    { $match: match },
    {
      $group: {
        _id: {
          year: { $year: "$firstOrderDate" },
          month: { $month: "$firstOrderDate" },
        },
        totalCustomers: { $sum: 1 },
      },
    },
    {
      $sort: {
        "_id.year": 1,
        "_id.month": 1,
      },
    },
    {
      $project: {
        _id: 0,
        month: {
          $concat: [
            {
              $switch: {
                branches: [
                  { case: { $eq: ["$_id.month", 1] }, then: "Jan" },
                  { case: { $eq: ["$_id.month", 2] }, then: "Feb" },
                  { case: { $eq: ["$_id.month", 3] }, then: "Mar" },
                  { case: { $eq: ["$_id.month", 4] }, then: "Apr" },
                  { case: { $eq: ["$_id.month", 5] }, then: "May" },
                  { case: { $eq: ["$_id.month", 6] }, then: "Jun" },
                  { case: { $eq: ["$_id.month", 7] }, then: "Jul" },
                  { case: { $eq: ["$_id.month", 8] }, then: "Aug" },
                  { case: { $eq: ["$_id.month", 9] }, then: "Sep" },
                  { case: { $eq: ["$_id.month", 10] }, then: "Oct" },
                  { case: { $eq: ["$_id.month", 11] }, then: "Nov" },
                  { case: { $eq: ["$_id.month", 12] }, then: "Dec" },
                ],
                default: "",
              },
            },
            " ",
            { $toString: "$_id.year" },
          ],
        },
        totalCustomers: 1,
      },
    },
  ]);

  res.status(200).json(data);
});

export const getAllCustomers = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const customers = await Customer.find(match).sort({ totalSpent: -1 });

  res.json(customers);
});

export const getCustomersByRegion = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const data = await Customer.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$region",
        value: { $sum: 1 },
      },
    },
    { $sort: { value: -1 } },
  ]);

  res.json(data);
});

export const getCustomerSegments = asyncHandler(async (req, res) => {
  const match = buildMatch(req);

  const data = await Customer.aggregate([
    { $match: match },
    {
      $group: {
        _id: "$customerType",
        value: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        name: "$_id",
        value: 1,
      },
    },
  ]);

  res.json(data);
});