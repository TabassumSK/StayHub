const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    guest: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
    },
    nightlyPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["upi", "card", "pay_at_property"],
      required: true,
    },
    status: {
      type: String,
      enum: ["awaiting_payment"],
      default: "awaiting_payment",
      required: true,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
