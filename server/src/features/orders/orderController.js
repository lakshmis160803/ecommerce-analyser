import Order from "./Order.js";
import UploadHistory from "../imports/UploadHistory.js";
import mongoose from "mongoose";
import Customer from "../customers/Customer.js";


const getUploadMatch = async (range,userId) => {
const filter = {
  fileType: "order",
};

if (userId) {
  filter.uploadedBy = userId;
}
  const now = new Date();

  switch (range) {
    case "today":
      filter.createdAt = {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      };
      break;

    case "yesterday":
      filter.createdAt = {
        $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1),
        $lt: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      };
      break;

    case "last7days":
      filter.createdAt = {
        $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      };
      break;

    case "last30days":
      filter.createdAt = {
        $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };
      break;

    case "thisMonth":
      filter.createdAt = {
        $gte: new Date(now.getFullYear(), now.getMonth(), 1),
      };
      break;

    case "lastMonth":
      filter.createdAt = {
        $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        $lt: new Date(now.getFullYear(), now.getMonth(), 1),
      };
      break;

    case "last3months":
      filter.createdAt = {
        $gte: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()),
      };
      break;

    case "thisYear":
      filter.createdAt = {
        $gte: new Date(now.getFullYear(), 0, 1),
      };
      break;

    case "all":
    default:
      break;
  }

  const uploads = await UploadHistory.find(filter).select("_id");

  return uploads.map((u) => u._id);
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
    console.log("Orders inserted:", result.length);
console.log(result[0]);
    console.log("Orders Saved:", result.length);
    console.log(result[0]);
    for (const order of result) {
  const totalAmount =
    Number(order.price || 0) *
    Number(order.quantity || 0);

 const existingCustomer = await Customer.findOne({
  customerName: order.customerName,
});
console.log({
  customerName: order.customerName,
  customerEmail: order.customerEmail,
  quantity: order.quantity,
  price: order.price,
});
  if (!existingCustomer) {
    let customerType = "Occasional";

    if (totalAmount >= 50000) {
      customerType = "Premium";
    } else if (totalAmount >= 20000) {
      customerType = "Regular";
    }

  try {
  console.log("Processing:", order.customerName);

const customer = await Customer.create({
  customerId: `CUST-${order.customerName}`,
  customerName: order.customerName,
  customerEmail: "",
  region: order.region,
  totalOrders: 1,
  totalSpent: totalAmount,
  averageOrderValue: totalAmount,
  totalQuantity: Number(order.quantity),
  firstOrderDate: order.orderDate,
  lastOrderDate: order.orderDate,
  customerType,
  uploadId: upload._id,
  uploadedBy: req.user.id,
});

console.log("Saved:", customer);
}
 catch (err) {
  console.error("Customer create failed:");
  console.error(err);
}
  } else {
    existingCustomer.totalOrders += 1;

    existingCustomer.totalSpent += totalAmount;

    existingCustomer.totalQuantity +=
      Number(order.quantity || 0);

    existingCustomer.averageOrderValue =
      existingCustomer.totalSpent /
      existingCustomer.totalOrders;

    existingCustomer.lastOrderDate =
      order.orderDate;

    if (existingCustomer.totalSpent >= 50000) {
      existingCustomer.customerType = "Premium";
    } else if (
      existingCustomer.totalSpent >= 20000
    ) {
      existingCustomer.customerType = "Regular";
    } else {
      existingCustomer.customerType =
        "Occasional";
    }

    await existingCustomer.save();
  }
}

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
    console.log("================================");
    console.log("Query:", req.query);

    // Get upload IDs based on date range
    const uploadIds = await getUploadMatch(
      req.query.range,
      req.user.id
    );

    console.log("Upload IDs:", uploadIds);
const match = {
  uploadId: { $in: uploadIds },
};

    console.log("Match:", match);

    const stats = await Order.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: {
            $sum: {
              $multiply: ["$price", "$quantity"],
            },
          },
          totalQuantity: {
            $sum: "$quantity",
          },
          avgOrderValue: {
            $avg: {
              $multiply: ["$price", "$quantity"],
            },
          },
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

    res.json(result);

  } catch (error) {
    console.log(error);
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
const uploadIds = await getUploadMatch(
  req.query.range,
  req.user.id
);
const match = {
  uploadId: { $in: uploadIds },
};
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
const uploadIds = await getUploadMatch(
  req.query.range,
  req.user.id
);
const match = {
  uploadId: { $in: uploadIds },
};
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
const uploadIds = await getUploadMatch(
  req.query.range,
  req.user.id
);

const match = {
  uploadId: { $in: uploadIds },
};

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
const uploadIds = await getUploadMatch(
  req.query.range,
  req.user.id
);

const match = {
  uploadId: { $in: uploadIds },
};
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
const uploadIds = await getUploadMatch(
  req.query.range,
  req.user.id
);
const match = {
  uploadId: { $in: uploadIds },
};

    const orders = await Order.find(match).sort({ orderDate: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};