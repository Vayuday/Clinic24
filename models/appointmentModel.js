// models/appointmentModel.js

const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "doctors",
      required: true,
    },

    // exact strings the user picked:
    slotDate: { type: String, required: true }, // "DD-MM-YYYY"
    slotTime: { type: String, required: true }, // "HH:mm"

    // also combine into a Date for any queries:
    dateTime: { type: Date, required: true },

    status: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("appointments", appointmentSchema);
