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

    price: {
      type: Number,
      default: null,
    },

    costPrice: {
      type: Number,
      default: null,
    },

    discountPrice: {
      type: Number,
      default: null,
    },

    currency: {
      type: String,
      default: "USD",
    },

    stock: {
      type: Number,
      default: null,
    },

    soldUnits: {
      type: Number,
      default: null,
    },

    rating: {
      type: Number,
      default: null,
    },

    reviewCount: {
      type: Number,
      default: null,
    },

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

productSchema.index(
  { productId: 1, userId: 1 },
  {
    unique: true,
    sparse: true,
  }
);

export default mongoose.model("Product", productSchema);