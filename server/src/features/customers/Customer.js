import mongoose from "mongoose";

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true,
    },

    customerName: {
      type: String,
      required: true,
    },

    customerEmail: {
      type: String,
      required: true,
    },

    phone: String,

    region: String,

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

    lastOrderDate: Date,

    firstOrderDate: Date,

    customerType: {
      type: String,
      enum: [
        "Premium",
        "Regular",
        "Occasional",
      ],
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

export default mongoose.model(
  "Customer",
  customerSchema
);