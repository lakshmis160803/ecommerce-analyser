export const detectDatasetType = (mapping) => {
  const mappedFields = Object.keys(mapping).filter(
    (key) => mapping[key] !== null
  );

  const productFields = [
    "productId",
    "productName",
    "category",
    "brand",
    "price",
    "costPrice",
    "stock",
    "soldUnits",
    "rating",
  ];

  const orderFields = [
    "orderId",
    "customerName",
    "productName",
    "quantity",
    "price",
    "region",
    "orderDate",
  ];

  const productScore =
    productFields.filter((field) =>
      mappedFields.includes(field)
    ).length;

  const orderScore =
    orderFields.filter((field) =>
      mappedFields.includes(field)
    ).length;

  console.log("Product Score:", productScore);
  console.log("Order Score:", orderScore);

  return orderScore > productScore
    ? "orders"
    : "products";
};