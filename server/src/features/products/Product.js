import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadHistory",
    },

    productId: String,
    sku: String,
    productName: String,
    description: String,

    category: String,
    brand: String,

    price: Number,
    costPrice: Number,
    discountPrice: Number,
    currency: {
      type: String,
      default: "USD",
    },

    stock: Number,
    soldUnits: Number,

    rating: Number,
    reviewCount: Number,

    region: String,

    colors: [String],
    sizes: [String],
    images: [String],

    status: {
      type: String,
      enum: ["active", "draft", "archived"],
      default: "active",
    },

    dateAdded: Date,

    // Preserves any columns from an import that couldn't be mapped
    // to a known field, so data isn't silently dropped.
    customFields: {
      type: Object,
      default: {},
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Prevents the same user from importing the exact same productId twice.
productSchema.index({ productId: 1, userId: 1 }, { unique: true, sparse: true });

export default mongoose.model("Product", productSchema);