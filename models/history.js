import mongoose from "mongoose";

const HistorySchema = new mongoose.Schema(
  {
    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },

        name: {
          type: String,
          required: true,
          trim: true,
        },

        quantity: {
          type: Number,
          required: true,
          min: 1,
        },

        sellingPrice: {
          type: Number,
          required: true,
          min: 0,
        },

        totalAmount: {
          type: Number,
          required: true,
          min: 0,
        },

        profit: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],

    discount: {
      type: Number,
      default: 0,
    },

    finalTotal: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true, // adds createdAt & updatedAt
  }
);

const HistoryModel =
  mongoose.models.History || mongoose.model("History", HistorySchema);

export default HistoryModel;
