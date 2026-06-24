import mongoose from "mongoose";
const productSchema =
  new mongoose.Schema(
    {
      uploadId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "UploadHistory",
      },

      productId: String,
      productName: String,
      category: String,
      brand: String,

      price: Number,
      costPrice: Number,

      stock: Number,
      soldUnits: Number,

      rating: Number,
      region: String,

      colors: [String],
      sizes: [String],

      dateAdded: Date,

      customFields: {
        type: Object,
        default: {},
      },
    },
    {
      timestamps: true,
    }
  );export default mongoose.model(
  "Product",
  productSchema
);