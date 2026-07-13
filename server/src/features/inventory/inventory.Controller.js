import mongoose from "mongoose";
import Product from "../products/Product.js";
import UploadHistory from "../imports/UploadHistory.js";


const getProductUploadIds = async (range, userId) => {
  const filter = {
    fileType: "product",
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

export const getInventoryDashboard = async (req, res) => {
  try {
    const uploadIds = await getProductUploadIds(
      req.query.range,
      req.user.id
    );

    const match = {
      uploadId: { $in: uploadIds },
      userId: new mongoose.Types.ObjectId(req.user.id),
    };

    const summary = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalStock: { $sum: "$stock" },
          inventoryValue: {
            $sum: {
              $multiply: ["$stock", "$costPrice"],
            },
          },
        },
      },
    ]);

   const lowStock = await Product.find({
  stock: {
    $gt: 0,
    $lt: 20,
  },
});

console.log(lowStock);

    const outOfStock = await Product.find({
      ...match,
      stock: 0,
    });

    const fastMoving = await Product.find(match)
      .sort({ soldUnits: -1 })
      .limit(10);

    const slowMoving = await Product.find(match)
      .sort({ soldUnits: 1 })
      .limit(10);

    const inventoryByCategory = await Product.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$category",
          stock: {
            $sum: "$stock",
          },
          value: {
            $sum: {
              $multiply: ["$stock", "$costPrice"],
            },
          },
        },
      },
      {
        $sort: {
          stock: -1,
        },
      },
    ]);

    const stockStatus = await Product.aggregate([
      { $match: match },
      {
        $project: {
          status: {
            $switch: {
              branches: [
                {
                  case: { $eq: ["$stock", 0] },
                  then: "Out Of Stock",
                },
                {
                  case: { $lt: ["$stock", 20] },
                  then: "Low Stock",
                },
              ],
              default: "Healthy",
            },
          },
        },
      },
      {
        $group: {
          _id: "$status",
          count: {
            $sum: 1,
          },
        },
      },
    ]);

    res.status(200).json({
      totalProducts: summary[0]?.totalProducts || 0,
      totalStock: summary[0]?.totalStock || 0,
      inventoryValue: summary[0]?.inventoryValue || 0,

      lowStock,
      outOfStock,

      fastMoving,
      slowMoving,

      inventoryByCategory,
      stockStatus,
    });
  } catch (err) {
    console.error(err);

    res.status(500).json({
      message: err.message,
    });
  }
};