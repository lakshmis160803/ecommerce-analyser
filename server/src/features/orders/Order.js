import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    orderId: String,

    customerName: String,

    productName: String,

    quantity: {
      type: Number,
      default: null,
    },

    price: {
      type: Number,
      default: null,
    },

    region: String,

    orderDate: Date,

    status: {
      type: String,
      default: "Completed",
    },

    customFields: {
      type: Object,
      default: {},
    },

    uploadId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UploadHistory",
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

export default mongoose.model("Order", orderSchema);