// Example: wire notifications into wherever stock actually changes.
// This is NOT a full controller — just the pattern to drop into
// addProduct, uploadProducts, and any future "updateStock" endpoint.

import { sendToUser } from "../notifications/notificationManager.js"; // adjust path

const LOW_STOCK_THRESHOLD = 20;

// Call this right after you create/update a product's stock value.
export const checkAndNotifyStock = (userId, product) => {
  if (product.stock === 0) {
    sendToUser(
      userId,
      {
        type: "OUT_OF_STOCK",
        productId: product.productId,
        productName: product.productName,
        message: `${product.productName} is now out of stock.`,
      },
      "stock-alert"
    );
  } else if (product.stock < LOW_STOCK_THRESHOLD) {
    sendToUser(
      userId,
      {
        type: "LOW_STOCK",
        productId: product.productId,
        productName: product.productName,
        stock: product.stock,
        message: `${product.productName} is running low (${product.stock} left).`,
      },
      "stock-alert"
    );
  }
};

// --- Example usage inside addProduct (from your products controller) ---
//
// const product = await Product.create({ ...fields, uploadId: upload._id, userId: req.user.id });
// checkAndNotifyStock(req.user.id, product);
// res.status(201).json({ success: true, data: product });

// --- Example usage inside uploadProducts (bulk CSV/Excel import) ---
//
// await Product.insertMany(products);
// products
//   .filter((p) => p.stock === 0 || p.stock < LOW_STOCK_THRESHOLD)
//   .forEach((p) => checkAndNotifyStock(req.user.id, p));
// res.status(200).json({ success: true, uploadId: upload._id, totalRecords: data.length });