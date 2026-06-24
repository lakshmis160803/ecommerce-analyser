// ✅ Comprehensive alias map for order fields
export const ORDER_FIELD_ALIASES = {
  orderId: [
    "order_id",
    "orderid",
    "order_no",
    "order_number",
  ],

  customerName: [
    "customer_name",
    "customername",
    "customer_id",
    "customerid",
  ],

  productName: [
    "product_name",
    "productname",
  ],

  quantity: [
    "quantity",
    "qty",
  ],

  price: [
    "price",
    "amount",
    "total_amount",
  ],

  region: [
    "region",
    "location",
  ],

  orderDate: [
    "order_date",
    "orderdate",
    "date",
  ],
};

// ✅ Same normalization as product mapping
export const normalizeOrderKey = (key) =>
  key.toLowerCase().replace(/[\s\-\.]+/g, "_");

export const autoMapOrderFields = (row) => {
  if (!row) return {};

  console.log("📋 ORDER RAW HEADERS:", Object.keys(row));

  const mapped = {};

  Object.keys(ORDER_FIELD_ALIASES).forEach((schemaField) => {
    const aliasList = ORDER_FIELD_ALIASES[schemaField];

    const matchedColumn = Object.keys(row).find((column) => {
      const normalized = normalizeOrderKey(column);
      return aliasList.includes(normalized);
    });

    mapped[schemaField] = matchedColumn || null;

    if (!matchedColumn) {
      console.warn(`⚠️  No match for order field "${schemaField}"`);
    } else {
      console.log(`✅ "${schemaField}" → "${matchedColumn}"`);
    }
  });

  return mapped;
};

// ✅ Auto-detect if a CSV is orders or products based on headers
export const detectFileType = (row) => {
  const headers = Object.keys(row).map((k) =>
    k.toLowerCase().replace(/[\s\-\.]+/g, "_")
  );

  const orderSignals = [
    "order_id", "orderid", "order_no", "order_number",
    "order_date", "orderdate", "customer_name", "customername",
    "transaction_id", "invoice_id", "invoice_no",
  ];

  const productSignals = [
    "product_id", "productid", "sku", "brand",
    "product_name", "productname", "cost_price",
    "stock", "sold_units", "soldunits",
  ];

  const orderScore   = headers.filter((h) => orderSignals.includes(h)).length;
  const productScore = headers.filter((h) => productSignals.includes(h)).length;

  console.log(`🔍 Detection — order score: ${orderScore}, product score: ${productScore}`);

  if (orderScore > productScore) return "order";
  if (productScore > orderScore) return "product";

  // tie-break — if has orderDate or customerId it's likely an order
  if (headers.some((h) => h.includes("order") || h.includes("customer"))) return "order";
  return "product"; // default
};