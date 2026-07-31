import asyncHandler from "../../middleware/asyncHandler.js";
import { askGemini } from "./gemini.service.js";

import {
  getBusinessSummary,
  getTopSellingProducts,
  getLowStockProducts,
  getTopCustomers,
  getRegionalBreakdown,
} from "../reports/report.service.js";

export const chatWithAI = asyncHandler(async (req, res) => {
  const { message, uploadId } = req.body;

  const summary = await getBusinessSummary(req.user.id, uploadId);
  const topProducts = await getTopSellingProducts(req.user.id, uploadId, 5);
  const lowStock = await getLowStockProducts(req.user.id, uploadId, 5);
  const topCustomers = await getTopCustomers(req.user.id, uploadId, 5);
  const regions = await getRegionalBreakdown(req.user.id, uploadId);

  const prompt = `
You are an AI assistant for an E-Commerce Intelligence Dashboard.

Answer ONLY using the following business data.
Do not invent information.
If the answer cannot be found, reply:
"I couldn't find that information in the uploaded dataset."

======================
BUSINESS SUMMARY
======================

${JSON.stringify(summary, null, 2)}

======================
TOP SELLING PRODUCTS
======================

${JSON.stringify(topProducts, null, 2)}

======================
LOW STOCK PRODUCTS
======================

${JSON.stringify(lowStock, null, 2)}

======================
TOP CUSTOMERS
======================

${JSON.stringify(topCustomers, null, 2)}

======================
REGIONAL ANALYSIS
======================

${JSON.stringify(regions, null, 2)}

======================
USER QUESTION
======================

${message}
`;

  const reply = await askGemini(prompt);

  res.json({
    success: true,
    reply,
  });
});