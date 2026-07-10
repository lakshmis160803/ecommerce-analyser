// ✅ Comprehensive alias map — covers every common naming convention
export const FIELD_ALIASES = {

  productId: [
    // snake_case
    "product_id", "item_id", "item_code",
    // camelCase
    "productid", "itemid", "itemcode",
    // short
    "sku", "code", "id", "pid", "prod_id",
    // misc
    "product_code", "article_number", "article_no",
    "ref", "reference", "ref_no", "ref_code",
    "barcode", "upc", "isbn", "asin",
    "number", "no", "serial", "serial_no",
  ],

  productName: [
    // snake_case
    "product_name", "item_name", "prod_name",
    // camelCase
    "productname", "itemname", "prodname",
    // short
    "name", "title", "product", "item",
    // misc
    "product_title", "item_title", "goods_name",
    "description", "desc", "label",
    "model", "model_name", "model_no",
  ],

  category: [
    "category", "cat", "category_name",
    "type", "product_type", "item_type",
    "group", "product_group", "item_group",
    "department", "dept", "section",
    "class", "classification", "segment",
    "subcategory", "sub_category", "sub_cat",
    "family", "line", "product_line",
  ],

  brand: [
    "brand", "brand_name", "brandname",
    "company", "company_name",
    "manufacturer", "mfr", "mfg",
    "maker", "vendor", "supplier",
    "label", "marque", "producer",
  ],

  price: [
    "price", "selling_price", "sale_price",
    "retail_price", "list_price", "unit_price",
    "sellingprice", "saleprice", "retailprice",
    "listprice", "unitprice",
    "mrp", "msrp", "rrp",
    "amount", "rate", "value",
    "sp", "sell_price", "sold_price",
  ],

  costPrice: [
    "cost_price", "buying_price", "buy_price",
    "purchase_price", "wholesale_price",
    "landed_cost", "net_price",
    "costprice", "buyingprice", "buyprice",
    "purchaseprice", "wholesaleprice",
    "cost", "cp", "cogs",
    "base_price", "original_price",
  ],

  stock: [
    "stock", "stock_quantity", "available_stock",
    "qty_available", "qty_on_hand",
    "on_hand", "in_stock", "current_stock",
    "stockquantity", "availablestock",
    "quantity", "qty", "inventory",
    "units", "units_available",
    "balance", "closing_stock",
  ],

  soldUnits: [
    "sold_units", "units_sold", "qty_sold",
    "quantity_sold", "items_sold",
    "total_sold", "no_sold",
    "soldunits", "unitssold", "qtysold",
    "quantitysold", "itemssold",
    "sold", "sales", "sales_qty",
    "sales_quantity", "sales_units",
    "orders", "total_orders",
  ],

  rating: [
    "rating", "avg_rating", "average_rating",
    "stars", "star_rating",
    "review_score", "review_rating",
    "score", "product_rating",
    "customer_rating", "user_rating",
    "ratings", "feedback_score",
  ],

  region: [
    "region", "region_name",
    "location", "loc",
    "area", "zone",
    "territory", "market",
    "state", "city", "country",
    "geography", "geo",
    "warehouse", "store",
    "branch", "division",
    "sales_region", "sales_area",
  ],

};

// ✅ Alias map for order files
export const ORDER_FIELD_ALIASES = {

  orderId: [
    "order_id", "orderid", "order_no", "orderno","orderid",
    "order_number", "ordernumber",
    "order_code", "ordercode",
    "id", "transaction_id", "transactionid",
    "invoice_id", "invoice_no", "invoiceno",
    "receipt_id", "receipt_no",
  ],

  customerName: [
    "customer_id","customerid",
    "customer_name", "customername",
    "client_name", "clientname",
    "buyer_name", "buyername",
    "customer", "client", "buyer",
    "name", "full_name", "fullname",
    "user_name", "username",
    "billing_name", "shipping_name",
  ],

  productName: [
    "product_name", "productname",
    "item_name", "itemname",
    "product", "item",
    "title", "description", "desc",
    "goods_name", "model", "model_name",
  ],

  quantity: [
    "quantity", "qty",
    "order_quantity", "orderquantity",
    "units", "units_ordered", "unitsordered",
    "no_of_units", "num_units",
    "count", "order_qty",
  ],

  price: [
    "price", "unit_price", "unitprice",
    "selling_price", "sellingprice",
    "sale_price", "saleprice",
    "amount", "rate", "value",
    "total_price", "totalprice",
    "order_amount", "order_value",
    "line_total", "subtotal",
  ],

  region: [
    "region", "region_name",
    "location", "loc",
    "area", "zone",
    "territory", "market",
    "state", "city", "country",
    "geography", "geo",
    "warehouse", "store",
    "branch", "division",
    "sales_region", "sales_area",
    "shipping_region", "delivery_region",
  ],

  orderDate: [
    "order_date", "orderdate",
    "date", "purchase_date", "purchasedate",
    "transaction_date", "transactiondate",
    "invoice_date", "invoicedate",
    "created_at", "createdat",
    "order_time", "ordertime",
    "timestamp",
  ],

};

export const normalizeKey = (key) =>
  key.toLowerCase().replace(/[\s\-\.]+/g, "_");

export const autoMapFields = (row) => {
  if (!row) return {};

  console.log("📋 RAW HEADERS:", Object.keys(row));

  const mapped = {};

  Object.keys(FIELD_ALIASES).forEach((schemaField) => {
    const aliasList = FIELD_ALIASES[schemaField];

    const matchedColumn = Object.keys(row).find((column) => {
      const normalized = normalizeKey(column);
      return aliasList.includes(normalized);
    });

    mapped[schemaField] = matchedColumn || null;

    if (!matchedColumn) {
      console.warn(`⚠️  No match for "${schemaField}" — column will default to 0 or ""`);
    } else {
      console.log(`✅ "${schemaField}" → "${matchedColumn}"`);
    }
  });

  return mapped;
};

// ✅ Same mapping strategy, but against the order alias list
export const autoMapOrderFields = (row) => {
  if (!row) return {};

  console.log("📋 RAW HEADERS (order):", Object.keys(row));

  const mapped = {};

  Object.keys(ORDER_FIELD_ALIASES).forEach((schemaField) => {
    const aliasList = ORDER_FIELD_ALIASES[schemaField];

    const matchedColumn = Object.keys(row).find((column) => {
      const normalized = normalizeKey(column);
      return aliasList.includes(normalized);
    });

    mapped[schemaField] = matchedColumn || null;

    if (!matchedColumn) {
      console.warn(`⚠️  No match for "${schemaField}" — column will default to 0 or ""`);
    } else {
      console.log(`✅ "${schemaField}" → "${matchedColumn}"`);
    }
  });

  return mapped;
};


export const detectFileType = (row) => {
  if (!row) return "product";

  const headers = Object.keys(row).map(normalizeKey);

  const countMatches = (aliasMap) =>
    Object.values(aliasMap).reduce((count, aliasList) => {
      const hasMatch = headers.some((header) =>
        aliasList.includes(header)
      );
      return hasMatch ? count + 1 : count;
    }, 0);

  const orderScore =
    countMatches(ORDER_FIELD_ALIASES);

  const productScore =
    countMatches(FIELD_ALIASES);

  console.log(
    "🔍 detectFileType",
    { orderScore, productScore }
  );

  // Strong order indicators
  const hasOrderId =
    headers.some((h) =>
      ORDER_FIELD_ALIASES.orderId.includes(h)
    );

  const hasCustomer =
    headers.some((h) =>
      ORDER_FIELD_ALIASES.customerName.includes(h)
    );

  const hasOrderDate =
    headers.some((h) =>
      ORDER_FIELD_ALIASES.orderDate.includes(h)
    );

  if (
    hasOrderId ||
    hasCustomer ||
    hasOrderDate
  ) {
    return "order";
  }

  return orderScore > productScore
    ? "order"
    : "product";
};