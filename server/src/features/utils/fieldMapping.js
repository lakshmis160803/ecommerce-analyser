// ✅ Comprehensive alias map — covers every common naming convention
export const FIELD_ALIASES = {

  productId: [
    "product_id", "item_id", "item_code",
    "productid", "itemid", "itemcode",
    "code", "id", "pid", "prod_id",
    "product_code", "article_number", "article_no",
    "ref", "reference", "ref_no", "ref_code",
    "barcode", "upc", "isbn", "asin",
    "number", "no", "serial", "serial_no",
  ],

  sku: [
    "sku", "sku_code", "sku_id",
    "product_sku", "item_sku",
    "stock_keeping_unit",
  ],

  productName: [
    "product_name", "item_name", "prod_name",
    "productname", "itemname", "prodname",
    "name", "title", "product", "item",
    "product_title", "item_title", "goods_name",
    "model", "model_name", "model_no",
  ],

  description: [
    "description", "desc",
    "product_description", "item_description",
    "details", "product_details",
    "long_description", "short_description",
    "product_information", "summary",
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

  discountPrice: [
    "discount_price", "discounted_price",
    "discountprice", "discountedprice",
    "offer_price", "offerprice",
    "special_price", "specialprice",
    "sale_discount_price", "final_price",
    "promo_price",
  ],

  currency: [
    "currency", "currency_code",
    "curr", "currencycode",
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

  reviewCount: [
    "review_count", "reviewcount",
    "num_reviews", "number_of_reviews",
    "total_reviews", "reviews_count",
    "no_of_reviews",
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

  images: [
    "image", "images",
    "image_url", "imageurl",
    "img", "img_url",
    "photo", "photos",
    "picture", "pictures",
    "product_image", "product_images",
    "thumbnail",
  ],

};

// ✅ Single, merged order alias map (superset of both earlier versions)
export const ORDER_FIELD_ALIASES = {

  orderId: [
    "order_id", "orderid", "order_no", "orderno",
    "order_number", "ordernumber",
    "order_code", "ordercode",
    "id", "transaction_id", "transactionid",
    "invoice_id", "invoice_no", "invoiceno",
    "receipt_id", "receipt_no",
  ],

  customerName: [
    "customer_id", "customerid",
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
    "total_amount",
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

// ✅ Single shared key normalizer (used by both product & order mapping)
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

  const mappedColumns = Object.values(mapped).filter(Boolean);

  const unknownColumns = Object.keys(row).filter(
    (column) => !mappedColumns.includes(column)
  );

  return {
    mapping: mapped,
    unknownColumns,
  };
};

// ✅ Same mapping strategy, but against the order alias list
// NOTE: returns { mapping, unknownColumns } — same shape as autoMapFields.
// If your existing code called autoMapOrderFields(row).orderId directly,
// change it to autoMapOrderFields(row).mapping.orderId.
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
      console.warn(`⚠️  No match for order field "${schemaField}"`);
    } else {
      console.log(`✅ "${schemaField}" → "${matchedColumn}"`);
    }
  });

  const mappedColumns = Object.values(mapped).filter(Boolean);

  const unknownColumns = Object.keys(row).filter(
    (column) => !mappedColumns.includes(column)
  );

  return {
    mapping: mapped,
    unknownColumns,
  };
};

export const detectFileType = (row) => {
  if (!row) return "product";

  const headers = Object.keys(row).map(normalizeKey);

  const countMatches = (aliasMap) =>
    Object.values(aliasMap).reduce((count, aliasList) => {
      const hasMatch = headers.some((header) => aliasList.includes(header));
      return hasMatch ? count + 1 : count;
    }, 0);

  const orderScore = countMatches(ORDER_FIELD_ALIASES);
  const productScore = countMatches(FIELD_ALIASES);

  console.log("🔍 detectFileType", { orderScore, productScore });

  // Strong order indicators — these short-circuit to "order" even on a tie
  const hasOrderId = headers.some((h) => ORDER_FIELD_ALIASES.orderId.includes(h));
  const hasCustomer = headers.some((h) => ORDER_FIELD_ALIASES.customerName.includes(h));
  const hasOrderDate = headers.some((h) => ORDER_FIELD_ALIASES.orderDate.includes(h));

  if (hasOrderId || hasCustomer || hasOrderDate) {
    return "order";
  }

  return orderScore > productScore ? "order" : "product";
};