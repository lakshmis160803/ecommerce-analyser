import Product from "../products/Product.js";
import mongoose from "mongoose";
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import Order from "../orders/Order.js";
import asyncHandler from "../../middleware/asyncHandler.js"; // adjust path to match your project

const getProductMatch = (userId, uploadId) => {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (uploadId && mongoose.Types.ObjectId.isValid(uploadId)) {
    match.uploadId = new mongoose.Types.ObjectId(uploadId);
  }

  return match;
};

const getCustomerMatch = (userId, uploadId) => {
  const match = {
    uploadedBy: new mongoose.Types.ObjectId(userId),
  };

  if (uploadId && mongoose.Types.ObjectId.isValid(uploadId)) {
    match.uploadId = new mongoose.Types.ObjectId(uploadId);
  }

  return match;
};

const getOrderMatch = (userId, uploadId) => {
  const match = {
    userId: new mongoose.Types.ObjectId(userId),
  };

  if (uploadId && mongoose.Types.ObjectId.isValid(uploadId)) {
    match.uploadId = new mongoose.Types.ObjectId(uploadId);
  }

  return match;
};

// ======================
// Get Report
// ======================

export const getReport = asyncHandler(async (req, res) => {
  const { uploadId, reportType } = req.query;

  const productMatch = getProductMatch(req.user.id, uploadId);
  // kept in case you use it later for a "customers" report type based on Product data
  const customerMatch = getCustomerMatch(req.user.id, uploadId);

  const summary = await Product.aggregate([
    { $match: productMatch },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalRevenue: {
          $sum: {
            $multiply: ["$price", "$soldUnits"],
          },
        },
        totalStock: { $sum: "$stock" },
        totalSoldUnits: { $sum: "$soldUnits" },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  let rows = [];

  switch (reportType) {
    case "sales":
      rows = await Product.find(productMatch)
        .select("productName category price soldUnits")
        .sort({ soldUnits: -1 });
      break;

    case "inventory":
      rows = await Product.find(productMatch)
        .select("productName category stock region")
        .sort({ stock: 1 });
      break;

    case "products":
      rows = await Product.find(productMatch)
        .select("productName brand category price rating")
        .sort({ createdAt: -1 });
      break;

    case "customers": {
      const orderMatch = getOrderMatch(req.user.id, uploadId);

      rows = await Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: "$customerName",
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: { $multiply: ["$price", "$quantity"] } },
            region: { $first: "$region" },
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
        { $sort: { totalSpent: -1 } },
      ]);

      break;
    }

    default:
      rows = await Product.find(productMatch);
      break;
  }

  res.json({
    totalProducts: summary[0]?.totalProducts || 0,
    totalRevenue: summary[0]?.totalRevenue || 0,
    totalStock: summary[0]?.totalStock || 0,
    totalSoldUnits: summary[0]?.totalSoldUnits || 0,
    avgRating: Number(summary[0]?.avgRating || 0).toFixed(2),
    rows,
  });
});

// ======================
// Export CSV
// ======================

export const exportCSV = asyncHandler(async (req, res) => {
  const { uploadId } = req.query;

  const productMatch = getProductMatch(req.user.id, uploadId);

  const products = await Product.find(productMatch).lean();

  const fields = [
    "productName",
    "category",
    "brand",
    "price",
    "stock",
    "soldUnits",
    "rating",
    "region",
  ];

  const parser = new Parser({ fields });
  const csv = parser.parse(products);

  res.header("Content-Type", "text/csv");
  res.attachment("report.csv");

  return res.send(csv);
});

// ======================
// Export Excel
// ======================

export const exportExcel = asyncHandler(async (req, res) => {
  const { uploadId } = req.query;

  const productMatch = getProductMatch(req.user.id, uploadId);

  const products = await Product.find(productMatch).lean();

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Report");

  sheet.columns = [
    { header: "Product", key: "productName", width: 30 },
    { header: "Category", key: "category", width: 20 },
    { header: "Brand", key: "brand", width: 20 },
    { header: "Price", key: "price", width: 15 },
    { header: "Stock", key: "stock", width: 15 },
    { header: "Sold Units", key: "soldUnits", width: 15 },
    { header: "Rating", key: "rating", width: 15 },
    { header: "Region", key: "region", width: 20 },
  ];

  products.forEach((product) => {
    sheet.addRow(product);
  });

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=report.xlsx");

  await workbook.xlsx.write(res);
  res.end();
});

// ======================
// Download Insights
// ======================

export const downloadInsights = asyncHandler(async (req, res) => {
  const { uploadId } = req.query;

  const productMatch = getProductMatch(req.user.id, uploadId);

  const stats = await Product.aggregate([
    { $match: productMatch },
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $multiply: ["$price", "$soldUnits"],
          },
        },
        totalProducts: { $sum: 1 },
        totalStock: { $sum: "$stock" },
        totalSoldUnits: { $sum: "$soldUnits" },
        avgRating: { $avg: "$rating" },
      },
    },
  ]);

  const report = stats[0] || {};

  const insights = `
E-Commerce Analytics Report

-----------------------------------------

Total Products : ${report.totalProducts || 0}

Total Revenue : ₹${report.totalRevenue || 0}

Total Stock : ${report.totalStock || 0}

Sold Units : ${report.totalSoldUnits || 0}

Average Rating : ${(report.avgRating || 0).toFixed(2)}

Business Insights

• Review products with low stock and restock them.

• Prioritize products with high sold units for promotions.

• Improve ratings for lower-rated products.

• Analyze regional trends to optimize inventory.

Generated on: ${new Date().toLocaleString()}
`;

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Content-Disposition", "attachment; filename=Insights.txt");
  res.send(insights);
});