// models/offer.js

import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      default: ""
    },

    applyTo: {
      type: String,
      enum: ["product", "category"],
      required: true
    },

    // target: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   required: true
    // },

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true
    },

    discountValue: {
      type: Number,
      required: true,
      min: 1
    },

    startDate: {
      type: Date,
      required: true
    },

    endDate: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: ["active", "expired", "inactive"],
      default: "active"
    }
  },
  {
    timestamps: true
  }
);

const offerModel = mongoose.model("Offer", offerSchema);

export default offerModel;