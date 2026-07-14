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

export const normalizeOrderKey = (key) =>
  key.toLowerCase().replace(/[\s\-\.]+/g, "_");


export const autoMapOrderFields = (row) => {
  if (!row) return { mapping: {}, unknownColumns: [] };

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

  const mappedColumns = Object.values(mapped).filter(Boolean);

  const unknownColumns = Object.keys(row).filter(
    (column) => !mappedColumns.includes(column)
  );

  return {
    mapping: mapped,
    unknownColumns,
  };
};

export const extractOrderFromRow = (row) => {
  const { mapping, unknownColumns } = autoMapOrderFields(row);

  const order = {
    orderId: mapping.orderId ? row[mapping.orderId] : null,
    customerName: mapping.customerName ? row[mapping.customerName] : "",
    productName: mapping.productName ? row[mapping.productName] : "",
    quantity: mapping.quantity ? Number(row[mapping.quantity]) || 0 : 0,
    price: mapping.price ? Number(row[mapping.price]) || 0 : 0,
    region: mapping.region ? row[mapping.region] : "",
    orderDate: mapping.orderDate ? row[mapping.orderDate] : null,
  };

  return { order, mapping, unknownColumns };
};