import Order from "../orders/Order.js";
import Customer from "./Customer.js";
import UploadHistory from "../imports/UploadHistory.js";
import mongoose from "mongoose";

const getUploadIds = async (range, userId) => {
  const filter = {
    uploadedBy: userId,
  };

  // Optional date range filtering
  if (range && range !== "all") {
    const now = new Date();
    let from = new Date();

    switch (range) {
      case "7days":
      case "last7days":
        from.setDate(now.getDate() - 7);
        break;

      case "30days":
      case "last30days":
        from.setDate(now.getDate() - 30);
        break;

      case "90days":
      case "last90days":
        from.setDate(now.getDate() - 90);
        break;

      case "365days":
      case "lastyear":
        from.setFullYear(now.getFullYear() - 1);
        break;

      default:
        from = null;
    }

    if (from) {
      filter.createdAt = {
        $gte: from,
      };
    }
  }

  const uploads = await UploadHistory.find(filter).select("_id");

  return uploads.map((u) => u._id);
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
  const uploadIds = await getUploadIds(
  req.query.range,
  req.user.id
);

const customers = await Customer.find({
  uploadId: { $in: uploadIds },
  uploadedBy: req.user.id,
});

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
   const uploadIds = await getUploadIds(
  req.query.range,
  req.user.id
);

const customers = await Customer.find({
  uploadId: { $in: uploadIds },
  uploadedBy: req.user.id,
})
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

export const getCustomerGrowth = async (req, res) => {
  try {
    const uploadIds = await getUploadIds(
      req.query.range,
      req.user.id
    );

    const data = await Customer.aggregate([
      {
        $match: {
          uploadId: { $in: uploadIds },
          uploadedBy: new mongoose.Types.ObjectId(req.user.id),
          firstOrderDate: {
            $exists: true,
            $ne: null,
          },
        },
      },
      {
        $group: {
          _id: {
            year: {
              $year: "$firstOrderDate",
            },
            month: {
              $month: "$firstOrderDate",
            },
          },
          totalCustomers: {
            $sum: 1,
          },
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
              {
                $toString: "$_id.year",
              },
            ],
          },
          totalCustomers: 1,
        },
      },
    ]);

    console.log("Customer Growth:", data);

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

   const uploadIds = await getUploadIds(
  req.query.range,
  req.user.id
);

const customers = await Customer.find({
  uploadId: { $in: uploadIds },
  uploadedBy: req.user.id,
}).sort({
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
const uploadIds = await getUploadIds(
  req.query.range,
  req.user.id
);

const match = {
  uploadId: { $in: uploadIds },
  uploadedBy: req.user.id,
};
    const data = await Customer.aggregate([
  {
    $match: match,
  },
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
    const uploadIds = await getUploadIds(
      req.query.range,
      req.user.id
    );

    const match = {
      uploadId: { $in: uploadIds },
      uploadedBy: new mongoose.Types.ObjectId(req.user.id),
    };

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

    console.log(data);

    res.json(data);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};