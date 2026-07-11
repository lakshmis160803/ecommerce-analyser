import Order from "../orders/Order.js";
import Customer from "./Customer.js";
import UploadHistory from "../imports/UploadHistory.js";
import mongoose from "mongoose";

// Bug fix: previously every query filtered by `uploadId: { $in: uploadIds }`,
// where uploadIds came from a separate UploadHistory lookup (getUploadIds).
// Any customer without a matching uploadId — or any case where the
// UploadHistory lookup returned an empty list — silently disappeared from
// every analytics endpoint. This mirrors the same bug (and the same fix)
// already applied in product.Controller.js.
//
// Fix: filter directly on the customer's own `createdAt` (it already has
// `timestamps: true`) instead of going through UploadHistory. This also
// future-proofs a "manually add customer" feature, since manually created
// customers won't have an uploadId either.
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

export const getUploads = async (req, res) => {
  try {
    const { fileType } = req.query;

    const filter = { uploadedBy: req.user.id };
    if (fileType) filter.fileType = fileType;

    const uploads = await UploadHistory.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: uploads });
  } catch (error) {
    console.error("getUploads error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ===============================
// Dashboard KPIs
// ===============================
export const getCustomerDashboard = async (req, res) => {
  try {
    const match = buildMatch(req);

    const customers = await Customer.find(match);

    const totalCustomers = customers.length;

    const repeatCustomers = customers.filter(
      (c) => c.totalOrders > 1
    ).length;

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
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

// ===============================
// Top Customers
// ===============================
export const getTopCustomers = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getCustomerGrowth = async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllCustomers = async (req, res) => {
  try {
    const match = buildMatch(req);

    const customers = await Customer.find(match).sort({ totalSpent: -1 });

    res.json(customers);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getCustomersByRegion = async (req, res) => {
  try {
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
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getCustomerSegments = async (req, res) => {
  try {
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
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};