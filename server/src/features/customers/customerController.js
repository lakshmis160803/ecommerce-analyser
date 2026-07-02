import Order from "../orders/Order.js";
import Customer from "./Customer.js";
import UploadHistory from "../imports/UploadHistory.js";
// -----------------------------
// Helper
// -----------------------------
const getUploadIds = async (range) => {
  const filter = {
    fileType: "order",
  };

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

    case "thisYear":
      filter.createdAt = {
        $gte: new Date(now.getFullYear(), 0, 1),
      };
      break;

    default:
      break;
  }

  const uploads = await UploadHistory.find(filter).select("_id");

  return uploads.map((u) => u._id);
};

// ===============================
// Dashboard KPIs
// ===============================
export const getCustomerDashboard = async (req, res) => {
  try {
    const customers = await Customer.find();

    const totalCustomers = customers.length;

    const repeatCustomers = customers.filter(
      (c) => c.totalOrders > 1
    ).length;

    const premiumCustomers = customers.filter(
      (c) => c.customerType === "Premium"
    ).length;

    const averageSpend =
      totalCustomers > 0
        ? customers.reduce(
            (sum, c) => sum + c.totalSpent,
            0
          ) / totalCustomers
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
    const customers = await Customer.find()
      .sort({
        totalSpent: -1,
      })
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

// ===============================
// Customer Segments
// ===============================


// ===============================
// Customer Growth
// ===============================
export const getCustomerGrowth = async (req, res) => {
  try {

    const data = await Customer.aggregate([
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%b %Y",
              date: "$firstOrderDate",
            },
          },
          totalCustomers: {
            $sum: 1,
          },
        },
      },
      {
        $project: {
          month: "$_id",
          totalCustomers: 1,
        },
      },
      {
        $sort: {
          month: 1,
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
export const getAllCustomers = async (req, res) => {
  try {

    const customers = await Customer.find().sort({
      totalSpent: -1,
    });

    res.json(customers);

  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};
export const getCustomersByRegion = async (req, res) => {
  try {

    const data = await Customer.aggregate([
      {
        $group: {
          _id: "$region",
          value: {
            $sum: 1,
          },
        },
      },
      {
        $sort: {
          value: -1,
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
export const getCustomerSegments = async (req, res) => {
  try {
    const data = await Customer.aggregate([
      {
        $group: {
          _id: "$customerType",
          value: {
            $sum: 1,
          },
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
    res.status(500).json({
      message: err.message,
    });
  }
};