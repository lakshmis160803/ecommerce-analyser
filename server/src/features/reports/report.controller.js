// src/features/reports/report.controller.js
import { Parser } from "json2csv";
import ExcelJS from "exceljs";
import asyncHandler from "../../middleware/asyncHandler.js";
import {
  getReportData,
  getProductsForExport,
  getBusinessSummary,
} from "./report.service.js";

// ======================
// Get Report
// ======================

export const getReport = asyncHandler(async (req, res) => {
  const { uploadId, reportType } = req.query;

  const data = await getReportData(req.user.id, uploadId, reportType);

  res.json(data);
});

// ======================
// Export CSV
// ======================

export const exportCSV = asyncHandler(async (req, res) => {
  const { uploadId } = req.query;

  const products = await getProductsForExport(req.user.id, uploadId);

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

  const products = await getProductsForExport(req.user.id, uploadId);

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

  const report = await getBusinessSummary(req.user.id, uploadId);

  const insights = `
E-Commerce Analytics Report

-----------------------------------------

Total Products : ${report.totalProducts}

Total Revenue : ₹${report.totalRevenue}

Total Stock : ${report.totalStock}

Sold Units : ${report.totalSoldUnits}

Average Rating : ${report.avgRating}

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