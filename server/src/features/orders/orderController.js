import Order from "./Order.js";
import UploadHistory from "../imports/UploadHistory.js";
import mongoose from "mongoose";

const buildOrderFilter = (uploadId) => {
  if (
    uploadId &&
    mongoose.Types.ObjectId.isValid(uploadId)
  ) {
    return {
      uploadId: new mongoose.Types.ObjectId(
        uploadId
      ),
    };
  }

  return {};
};

// ==========================
// UPLOAD ORDERS
// ==========================

export const uploadOrders = async (
  req,
  res
) => {
  try {
    const { fileName, data } = req.body;

    if (
      !data ||
      !Array.isArray(data) ||
      data.length === 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "No order data provided",
      });
    }

    const upload =
      await UploadHistory.create({
        fileName:
          fileName || "unknown_file",
        totalRecords: data.length,
        fileType: "order",
      });

    const orders = data.map(
      (order) => ({
        ...order,
        uploadId: upload._id,

        orderDate:
          order.orderDate
            ? new Date(
                order.orderDate
              )
            : new Date(),
      })
    );

    const result =
      await Order.insertMany(
        orders
      );

    console.log(
      "Orders Saved:",
      result.length
    );

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

export const getOrderStats = async (
  req,
  res
) => {
  try {
    const match =
      buildOrderFilter(
        req.query.uploadId
      );

    const stats =
      await Order.aggregate([
        { $match: match },

        {
          $group: {
            _id: null,

            totalOrders: {
              $sum: 1,
            },

            totalRevenue: {
              $sum: {
                $multiply: [
                  "$price",
                  "$quantity",
                ],
              },
            },

            totalQuantity: {
              $sum: "$quantity",
            },

            avgOrderValue: {
              $avg: {
                $multiply: [
                  "$price",
                  "$quantity",
                ],
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

    const { _id, ...result } =
      stats[0];

    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
  const availableFields = {
  price: await Order.exists({ price: { $gt: 0 } }),
  status: await Order.exists({ status: { $ne: null } }),
  productName: await Order.exists({ productName: { $ne: null } }),
  customerName: await Order.exists({ customerName: { $ne: null } }),
  region: await Order.exists({ region: { $ne: null } }),
};

res.json({
  ...result,
  availableFields,
});
};

// ==========================
// STATUS PIE CHART
// ==========================

export const getOrdersByStatus =
  async (req, res) => {
    try {
      const match =
        buildOrderFilter(
          req.query.uploadId
        );

      const data =
        await Order.aggregate([
          { $match: match },

          {
            $group: {
              _id: "$status",

              value: {
                $sum: 1,
              },
            },
          },
        ]);

      res.json(
        data.map((item) => ({
          name:
            item._id || "Unknown",

          value: item.value,
        }))
      );
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// ==========================
// TOP PRODUCTS
// ==========================

export const getOrdersByProduct =
  async (req, res) => {
    try {
      const match =
        buildOrderFilter(
          req.query.uploadId
        );

      const stats =
        await Order.aggregate([
          { $match: match },

          {
            $group: {
              _id: "$productName",

              quantity: {
                $sum: "$quantity",
              },

              revenue: {
                $sum: {
                  $multiply: [
                    "$price",
                    "$quantity",
                  ],
                },
              },

              orders: {
                $sum: 1,
              },
            },
          },

          {
            $sort: {
              quantity: -1,
            },
          },

          { $limit: 10 },
        ]);

      res.json(stats);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };

// ==========================
// ORDERS TREND
// ==========================

export const getOrdersByDate = async (req, res) => {
  try {
    const match = buildOrderFilter(req.query.uploadId);

  
    const formatted = data.map((item) => ({
      month: item._id,
      orders: item.orders,
      revenue: item.revenue,
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// TOP CUSTOMERS

export const getTopCustomers =
  async (req, res) => {
    try {
      const match =
        buildOrderFilter(
          req.query.uploadId
        );

      const customers =
        await Order.aggregate([
          { $match: match },

          {
            $group: {
              _id:
                "$customerName",

              orders: {
                $sum: 1,
              },

              totalSpent: {
                $sum: {
                  $multiply: [
                    "$price",
                    "$quantity",
                  ],
                },
              },
            },
          },

          {
            $sort: {
              totalSpent: -1,
            },
          },

          {
            $limit: 10,
          },
        ]);

      res.json(customers);
    } catch (error) {
      res.status(500).json({
        message:
          error.message,
      });
    }
  };