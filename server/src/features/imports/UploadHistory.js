import mongoose from "mongoose";

const uploadHistorySchema = new mongoose.Schema(
  {
    fileName: String,

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    totalRecords: Number,

    fileType: {
      type: String,
      enum: ["product", "order"],
      default: "product", 
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("UploadHistory", uploadHistorySchema);