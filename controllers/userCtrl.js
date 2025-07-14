// controllers/userCtrl.js

const userModel        = require("../models/userModels");
const doctorModel      = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const bcrypt           = require("bcryptjs");
const jwt              = require("jsonwebtoken");
const moment           = require("moment");

// REGISTER
const registerController = async (req, res) => {
  try {
    const exists = await userModel.findOne({ email: req.body.email });
    if (exists) {
      return res
        .status(409)
        .send({ success: false, message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(req.body.password, salt);

    const user = new userModel({
      name: req.body.name,
      email: req.body.email,
      password: hash,
    });

    await user.save();
    res.status(201).send({ success: true, message: "Registered successfully" });
  } catch (err) {
    console.error("registerController error:", err);
    res.status(500).send({ success: false, message: err.message });
  }
};

// LOGIN
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }

    const match = await bcrypt.compare(req.body.password, user.password);
    if (!match) {
      return res
        .status(401)
        .send({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.send({ success: true, message: "Login success", token });
  } catch (err) {
    console.error("loginController error:", err);
    res.status(500).send({ success: false, message: err.message });
  }
};

// AUTH VERIFY
const authController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).send({ success: false, message: "User not found" });
    }
    res.send({ success: true, data: user });
  } catch (err) {
    console.error("authController error:", err);
    res.status(500).send({ success: false, message: err.message });
  }
};

// APPLY DOCTOR
const applyDoctorController = async (req, res) => {
  try {
    const doc = new doctorModel({ ...req.body, status: "pending" });
    await doc.save();

    const admin = await userModel.findOne({ isAdmin: true });
    admin.notification.push({
      type: "apply-doctor-request",
      message: `${doc.firstName} ${doc.lastName} has applied`,
      onClickPath: "/admin/doctors",
    });
    await admin.save();

    res.send({ success: true, message: "Applied successfully" });
  } catch (err) {
    console.error("applyDoctorController error:", err);
    res.status(500).send({ success: false, message: err.message });
  }
};

// GET ALL DOCTORS
const getAllDoctorsController = async (req, res) => {
  try {
    const docs = await doctorModel.find({ status: "approved" });
    res.send({ success: true, data: docs });
  } catch (err) {
    console.error("getAllDoctorsController error:", err);
    res.status(500).send({ success: false, message: err.message });
  }
};

// BOOK APPOINTMENT
const bookAppointmentController = async (req, res) => {
  try {
    const {
      slotDate, slotTime, dateTime: frontDateTime,
      doctorId, userInfo,
    } = req.body;

    const dateTime = frontDateTime;

    const newAppt = new appointmentModel({
      userId:   req.userId,
      doctorId,
      slotDate,
      slotTime,
      dateTime,
    });
    await newAppt.save();

    // notify doctor
    const docProfile = await doctorModel.findById(doctorId);
    const docUser    = await userModel.findById(docProfile.userId);
    docUser.notification.push({
      type:    "New-appointment-request",
      message: `New appointment from ${userInfo.name}`,
      onClickPath: "/doctor/appointments",
    });
    await docUser.save();

    return res.status(200).send({
      success: true,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("bookAppointmentController error:", error);
    return res.status(500).send({
      success: false,
      message: "Error while booking appointment",
      error,
    });
  }
};

// BOOKING AVAILABILITY
const bookingAvailabilityController = async (req, res) => {
  try {
    const { slotDate, slotTime, doctorId } = req.body;
    const target = moment(`${slotDate} ${slotTime}`, "DD-MM-YYYY HH:mm");
    const from   = target.clone().subtract(1, "hours").toDate();
    const to     = target.clone().add(1, "hours").toDate();

    const appts = await appointmentModel.find({
      doctorId,
      dateTime: { $gte: from, $lte: to },
    });

    return res.status(200).send({
      success: true,
      message: appts.length
        ? "Appointments not available at this time"
        : "Appointments available",
    });
  } catch (err) {
    console.error("bookingAvailabilityController error:", err);
    res.status(500).send({ success: false, message: err.message });
  }
};

// GET all appointments for the logged-in user
const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel
      .find({ userId: req.userId })
      .populate("doctorId", "firstName lastName");
    return res.status(200).send({
      success: true,
      data: appointments,
    });
  } catch (error) {
    console.error("userAppointmentsController error:", error);
    return res.status(500).send({
      success: false,
      message: "Error fetching user appointments",
      error,
    });
  }
};

// ───────────────────────────────────────────────────────────────
// MARK ALL AS READ
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    user.seennotification.push(...user.notification);
    user.notification = [];
    await user.save();

    return res.status(200).send({
      success: true,
      message: "All notifications marked as read",
      data: {
        notification: user.notification,
        seennotification: user.seennotification,
      },
    });
  } catch (error) {
    console.error("getAllNotificationController error:", error);
    return res.status(500).send({
      success: false,
      message: "Error marking notifications read",
      error,
    });
  }
};

// DELETE ALL READ
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findById(req.userId);
    if (!user) {
      return res
        .status(404)
        .send({ success: false, message: "User not found" });
    }

    user.seennotification = [];
    await user.save();

    return res.status(200).send({
      success: true,
      message: "All read notifications deleted",
      data: {
        seennotification: user.seennotification,
      },
    });
  } catch (error) {
    console.error("deleteAllNotificationController error:", error);
    return res.status(500).send({
      success: false,
      message: "Error deleting read notifications",
      error,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  authController,
  applyDoctorController,
  getAllDoctorsController,
  bookAppointmentController,
  bookingAvailabilityController,
  userAppointmentsController,
  getAllNotificationController,
  deleteAllNotificationController,
};
