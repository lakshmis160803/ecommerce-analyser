import mongoose from "mongoose";
import Order from "../orders/Order.js";
export const getRegionalDashboard = async (req, res) => {
  try {
   const match = {
  userId: new mongoose.Types.ObjectId(req.user.id),
};

const regions = await Order.aggregate([
  {
    $match: match,
  },
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
      (sum, r) => sum + r.revenue,
      0
    );

    const highestRevenueRegion =
      regions.length > 0 ? regions[0]._id : "-";

    const highestOrdersRegion =
      regions.sort((a, b) => b.orders - a.orders)[0]?._id || "-";

    res.json({
      totalRegions,
      totalRevenue,
      highestRevenueRegion,
      highestOrdersRegion,
    });

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
export const getRevenueByRegion = async (req, res) => {
  try {
const match = {
  userId: new mongoose.Types.ObjectId(req.user.id),
};

const data = await Order.aggregate([
  {
    $match: match,
  },
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

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
export const getOrdersByRegion = async (req, res) => {
  try {

  const match = {
  userId: new mongoose.Types.ObjectId(req.user.id),
};

const data = await Order.aggregate([
  {
    $match: match,
  },
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

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
export const getQuantityByRegion = async (req, res) => {
  try {

const match = {
  userId: new mongoose.Types.ObjectId(req.user.id),
};

const data = await Order.aggregate([
  {
    $match: match,
  },
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

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
export const getRegionalTable = async (req, res) => {
  try {
const match = {
  userId: new mongoose.Types.ObjectId(req.user.id),
};

const data = await Order.aggregate([
  {
    $match: match,
  },
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

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};