// src/features/reports/report.service.js

import mongoose from "mongoose";
import Product from "../products/Product.js";
import Order from "../orders/Order.js";

const productMatch = (userId, uploadId) => {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (uploadId && mongoose.Types.ObjectId.isValid(uploadId)) {
    match.uploadId = new mongoose.Types.ObjectId(uploadId);
  }

  return match;
};

const orderMatch = (userId, uploadId) => {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (uploadId && mongoose.Types.ObjectId.isValid(uploadId)) {
    match.uploadId = new mongoose.Types.ObjectId(uploadId);
  }

  return match;
};

// --------------------------------------------------
// BUSINESS SUMMARY
// --------------------------------------------------

export async function getBusinessSummary(userId, uploadId) {
  const stats = await Product.aggregate([
    {
      $match: productMatch(userId, uploadId),
    },
    {
      $group: {
        _id: null,

        totalProducts: {
          $sum: 1,
        },

        totalRevenue: {
          $sum: {
            $multiply: ["$price", "$soldUnits"],
          },
        },

        totalStock: {
          $sum: "$stock",
        },

        totalSoldUnits: {
          $sum: "$soldUnits",
        },

        avgRating: {
          $avg: "$rating",
        },
      },
    },
  ]);

  const s = stats[0] || {};

  return {
    totalProducts: s.totalProducts || 0,
    totalRevenue: s.totalRevenue || 0,
    totalStock: s.totalStock || 0,
    totalSoldUnits: s.totalSoldUnits || 0,
    avgRating: Number(s.avgRating || 0).toFixed(2),
  };
}

// --------------------------------------------------
// SALES REPORT ROWS
// --------------------------------------------------

export async function getSalesRows(userId, uploadId) {
  return Product.find(productMatch(userId, uploadId))
    .select("productName category price soldUnits")
    .sort({ soldUnits: -1 });
}

// --------------------------------------------------
// INVENTORY REPORT ROWS
// --------------------------------------------------

export async function getInventoryRows(userId, uploadId) {
  return Product.find(productMatch(userId, uploadId))
    .select("productName category stock region")
    .sort({ stock: 1 });
}

// --------------------------------------------------
// PRODUCT REPORT ROWS
// --------------------------------------------------

export async function getProductRows(userId, uploadId) {
  return Product.find(productMatch(userId, uploadId))
    .select("productName brand category price rating")
    .sort({ createdAt: -1 });
}

// --------------------------------------------------
// CUSTOMER REPORT ROWS
// --------------------------------------------------

export async function getCustomerRows(userId, uploadId) {
  return Order.aggregate([
    {
      $match: orderMatch(userId, uploadId),
    },
    {
      $group: {
        _id: "$customerName",

        totalOrders: {
          $sum: 1,
        },

        totalSpent: {
          $sum: {
            $multiply: ["$price", "$quantity"],
          },
        },

        region: {
          $first: "$region",
        },
      },
    },
    {
      $project: {
        _id: 0,
        customerName: "$_id",
        totalOrders: 1,
        totalSpent: 1,
        region: 1,
      },
    },
    {
      $sort: {
        totalSpent: -1,
      },
    },
  ]);
}

// --------------------------------------------------
// ALL PRODUCTS
// --------------------------------------------------

export async function getAllProducts(userId, uploadId) {
  return Product.find(productMatch(userId, uploadId));
}

// --------------------------------------------------
// REPORT DATA
// --------------------------------------------------

export async function getReportData(userId, uploadId, reportType) {
  const summary = await getBusinessSummary(userId, uploadId);

  let rows;

  switch (reportType) {
    case "sales":
      rows = await getSalesRows(userId, uploadId);
      break;

    case "inventory":
      rows = await getInventoryRows(userId, uploadId);
      break;

    case "products":
      rows = await getProductRows(userId, uploadId);
      break;

    case "customers":
      rows = await getCustomerRows(userId, uploadId);
      break;

    default:
      rows = await getAllProducts(userId, uploadId);
      break;
  }

  return {
    ...summary,
    rows,
  };
}

// --------------------------------------------------
// PRODUCTS FOR EXPORT
// --------------------------------------------------

export async function getProductsForExport(userId, uploadId) {
  return Product.find(
    productMatch(userId, uploadId)
  ).lean();
}

// --------------------------------------------------
// TOP SELLING PRODUCTS
// --------------------------------------------------

export async function getTopSellingProducts(
  userId,
  uploadId,
  limit = 10
) {
  return Product.find(
    productMatch(userId, uploadId)
  )
    .select(
      "productName category price soldUnits region -_id"
    )
    .sort({
      soldUnits: -1,
    })
    .limit(limit)
    .lean();
}

// --------------------------------------------------
// LOW STOCK PRODUCTS
// --------------------------------------------------

export async function getLowStockProducts(
  userId,
  uploadId,
  limit = 10
) {
  return Product.find(
    productMatch(userId, uploadId)
  )
    .select(
      "productName category stock region -_id"
    )
    .sort({
      stock: 1,
    })
    .limit(limit)
    .lean();
}

// --------------------------------------------------
// PRODUCT CATALOG
// --------------------------------------------------

export async function getProductCatalog(
  userId,
  uploadId,
  limit = 20
) {
  return Product.find(
    productMatch(userId, uploadId)
  )
    .select(
      "productName brand category price rating -_id"
    )
    .sort({
      createdAt: -1,
    })
    .limit(limit)
    .lean();
}

// --------------------------------------------------
// TOP CUSTOMERS
// --------------------------------------------------

export async function getTopCustomers(
  userId,
  uploadId,
  limit = 10
) {
  const rows = await getCustomerRows(
    userId,
    uploadId
  );

  return rows.slice(0, limit);
}

// --------------------------------------------------
// REGIONAL BREAKDOWN
// --------------------------------------------------

export async function getRegionalBreakdown(
  userId,
  uploadId
) {
  return Product.aggregate([
    {
      $match: productMatch(userId, uploadId),
    },
    {
      $group: {
        _id: "$region",

        totalRevenue: {
          $sum: {
            $multiply: [
              "$price",
              "$soldUnits",
            ],
          },
        },

        totalStock: {
          $sum: "$stock",
        },

        totalSoldUnits: {
          $sum: "$soldUnits",
        },
      },
    },
    {
      $project: {
        _id: 0,

        region: "$_id",

        totalRevenue: 1,

        totalStock: 1,

        totalSoldUnits: 1,
      },
    },
    {
      $sort: {
        totalRevenue: -1,
      },
    },
  ]);
}