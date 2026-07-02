import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      unique: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    region: {
      type: String,
      default: "Unknown",
    },

    city: String,
    state: String,
    country: String,

    totalOrders: {
      type: Number,
      default: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
    },

    averageOrderValue: {
      type: Number,
      default: 0,
    },

    totalQuantity: {
      type: Number,
      default: 0,
    },

    firstOrderDate: Date,

    lastOrderDate: Date,

    customerType: {
      type: String,
      enum: ["Premium", "Regular", "Occasional"],
      default: "Occasional",
    },

    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadHistory",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Customer", customerSchema);