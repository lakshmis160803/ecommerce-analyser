import Order from "./Order.js";
import UploadHistory from "../imports/UploadHistory.js";
import mongoose from "mongoose";

const buildOrderFilter = (uploadId, userId) => {
  const filter = { userId: new mongoose.Types.ObjectId(userId) };

  if (uploadId && mongoose.Types.ObjectId.isValid(uploadId)) {
    filter.uploadId = new mongoose.Types.ObjectId(uploadId);
  }

  return filter;
};

const excelSerialToDate = (serial) => {
  const utcDays = Math.floor(serial - 25569);
  const utcValue = utcDays * 86400;
  return new Date(utcValue * 1000);
};

const parseOrderDate = (value) => {
  if (!value) return new Date();
  if (typeof value === "number") {
    return excelSerialToDate(value);
  }
  const d = new Date(value);
  return isNaN(d.getTime()) ? new Date() : d;
};

// ==========================
// UPLOAD ORDERS
// ==========================

export const uploadOrders = async (req, res) => {
  try {
    const { fileName, data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No order data provided",
      });
    }

    const upload = await UploadHistory.create({
      fileName: fileName || "unknown_file",
      totalRecords: data.length,
      fileType: "order",
      uploadedBy: req.user.id,
    });

    const orders = data.map((order) => {
      return {
        ...order,
        uploadId: upload._id,
        userId: req.user.id,
        orderDate: parseOrderDate(order.orderDate),
      };
    });

    const result = await Order.insertMany(orders);

    console.log("Orders Saved:", result.length);

    res.status(200).json({
      success: true,
      uploadId: upload._id,
      totalRecords: data.length,
      fileType: "order",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// KPI STATS
// ==========================

export const getOrderStats = async (req, res) => {
  try {
    const match = buildOrderFilter(req.query.uploadId, req.user.id);

    const stats = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          totalQuantity: { $sum: "$quantity" },
          avgOrderValue: { $avg: { $multiply: ["$price", "$quantity"] } },
        },
      },
    ]);

    if (!stats.length) {
      return res.json({
        totalOrders: 0,
        totalRevenue: 0,
        totalQuantity: 0,
        avgOrderValue: 0,
      });
    }

    const { _id, ...result } = stats[0];

    const availableFields = {
      price: await Order.exists({ userId: req.user.id, price: { $gt: 0 } }),
      status: await Order.exists({ userId: req.user.id, status: { $ne: null } }),
      productName: await Order.exists({ userId: req.user.id, productName: { $ne: null } }),
      customerName: await Order.exists({ userId: req.user.id, customerName: { $ne: null } }),
      region: await Order.exists({ userId: req.user.id, region: { $ne: null } }),
    };

    res.json({
      ...result,
      availableFields,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// STATUS PIE CHART
// ==========================

export const getOrdersByStatus = async (req, res) => {
  try {
    const match = buildOrderFilter(req.query.uploadId, req.user.id);

    const data = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$status",
          value: { $sum: 1 },
        },
      },
    ]);

    res.json(
      data.map((item) => ({
        name: item._id || "Unknown",
        value: item.value,
      }))
    );
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// TOP PRODUCTS
// ==========================

export const getOrdersByProduct = async (req, res) => {
  try {
    const match = buildOrderFilter(req.query.uploadId, req.user.id);

    const stats = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$productName",
          quantity: { $sum: "$quantity" },
          revenue: { $sum: { $multiply: ["$price", "$quantity"] } },
          orders: { $sum: 1 },
        },
      },
      { $sort: { quantity: -1 } },
      { $limit: 10 },
    ]);

    res.json(stats);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// ORDERS TREND
// ==========================

export const getOrdersByDate = async (req, res) => {
  try {
    const match = buildOrderFilter(req.query.uploadId, req.user.id);

    const data = await Order.aggregate([
      {
        $match: {
          ...match,
          orderDate: { $type: "date" },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%b %Y",
              date: "$orderDate",
            },
          },
          orders: { $sum: 1 },
          revenue: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const formatted = data.map((item) => ({
      month: item._id,
      orders: item.orders,
      revenue: item.revenue,
    }));

    res.json(formatted);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// TOP CUSTOMERS
// ==========================

export const getTopCustomers = async (req, res) => {
  try {
    const match = buildOrderFilter(req.query.uploadId, req.user.id);

    const customers = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$customerName",
          orders: { $sum: 1 },
          totalSpent: { $sum: { $multiply: ["$price", "$quantity"] } },
        },
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 },
    ]);

    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ==========================
// ALL ORDERS
// ==========================

export const getAllOrders = async (req, res) => {
  try {
    const match = buildOrderFilter(req.query.uploadId, req.user.id);

    const orders = await Order.find(match).sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};