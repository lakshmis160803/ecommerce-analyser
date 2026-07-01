import Order from "../orders/Order.js";
import Customer from "../customers/Customer.js";
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
    const uploadIds = await getUploadIds(req.query.range);

    const customers = await Order.aggregate([
      {
        $match: {
          uploadId: { $in: uploadIds },
        },
      },
      {
        $group: {
          _id: "$customerName",
          totalSpent: {
            $sum: {
              $multiply: ["$price", "$quantity"],
            },
          },
          orders: { $sum: 1 },
        },
      },
    ]);

    const totalCustomers = customers.length;

    const repeatCustomers = customers.filter(
      (c) => c.orders > 1
    ).length;

    const newCustomers = totalCustomers - repeatCustomers;

    const avgSpend =
      totalCustomers > 0
        ? customers.reduce(
            (sum, c) => sum + c.totalSpent,
            0
          ) / totalCustomers
        : 0;

  res.json({
  totalCustomers,
  repeatCustomers,
  newCustomers,
  averageSpend: avgSpend,
});
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

// ===============================
// Top Customers
// ===============================
export const getTopCustomers = async (req, res) => {
  try {
    const uploadIds = await getUploadIds(req.query.range);

    const customers = await Order.aggregate([
      {
        $match: {
          uploadId: { $in: uploadIds },
        },
      },
      {
        $group: {
          _id: "$customerName",
          orders: { $sum: 1 },
          quantity: { $sum: "$quantity" },
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
      {
        $limit: 10,
      },
    ]);

    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
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
    const uploadIds = await getUploadIds(req.query.range);

    const data = await Order.aggregate([
      {
        $match: {
          uploadId: { $in: uploadIds },
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
          customers: {
            $addToSet: "$customerName",
          },
        },
      },
      {
        $project: {
          month: "$_id",
          totalCustomers: {
            $size: "$customers",
          },
        },
      },
      {
        $sort: {
          month: 1,
        },
      },
    ]);

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getAllCustomers = async (req, res) => {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: "$customerEmail",
          customerName: { $first: "$customerName" },
          region: { $first: "$region" },
          orders: { $sum: 1 },
          totalSpent: {
            $sum: {
              $multiply: ["$price", "$quantity"],
            },
          },
          avgOrderValue: {
            $avg: {
              $multiply: ["$price", "$quantity"],
            },
          },
        },
      },
      {
        $sort: {
          totalSpent: -1,
        },
      },
    ]);

    res.json(customers);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
export const getCustomersByRegion = async (req,res)=>{

const data = await Customer.aggregate([

{
    $group:{
        _id:"$region",
        value:{$sum:1}
    }
}

]);

res.json(data);

}
export const getCustomerSegments = async (req, res) => {
  try {
    const data = await Customer.aggregate([
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
    res.status(500).json({
      message: err.message,
    });
  }
};