// controllers/doctorCtrl.js
const appointmentModel = require("../models/appointmentModel");
const doctorModel      = require("../models/doctorModel");
const userModel        = require("../models/userModels");

// Fetch logged‑in doctor’s profile
exports.getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    return res.status(200).json({
      success: true,
      message: "doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error in Fetching Doctor Details",
      error: error.message,
    });
  }
};

// Update doctor profile
exports.updateProfileController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      req.body,
      { new: true }
    );
    return res.status(200).json({
      success: true,
      message: "Doctor Profile Updated",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Doctor Profile Update issue",
      error: error.message,
    });
  }
};

// Fetch a single doctor by ID
exports.getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findById(req.body.doctorId);
    return res.status(200).json({
      success: true,
      message: "Single Doc Info Fetched",
      data: doctor,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error in Single doctor info",
      error: error.message,
    });
  }
};

// STEP 2 instrumentation + actual appointments logic
exports.doctorAppointmentsController = async (req, res) => {
  console.log('>>> [doctorAppointmentsController] req.method:', req.method);
  console.log('>>> [doctorAppointmentsController] req.path:',   req.path);
  console.log('>>> [doctorAppointmentsController] Authorization header:', req.headers.authorization);
  console.log('>>> [doctorAppointmentsController] req.userId:', req.userId);
  console.log('>>> [doctorAppointmentsController] req.body:',   req.body);

  try {
    const doctor = await doctorModel.findOne({ userId: req.userId });
    if (!doctor) {
      console.log('>>> [doctorAppointmentsController] no doctor found');
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    const appointments = await appointmentModel
      .find({ doctorId: doctor._id })
      .sort({ date: 1, time: 1 });

    console.log('>>> [doctorAppointmentsController] returning appointments count:', appointments.length);
    return res.status(200).json({
      success: true,
      message: 'Doctor Appointments fetched successfully',
      data: appointments,
    });
  } catch (error) {
    console.error('💥 [doctorAppointmentsController] caught error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};
// controllers/doctorCtrl.js

// Update appointment status
exports.updateStatusController = async (req, res) => {
  try {
    // support both keys in case frontend uses one or the other
    const appointmentId = req.body.appointmentId || req.body.appointmentsId;
    const { status } = req.body;

    if (!appointmentId) {
      return res.status(400).json({ success: false, message: "No appointmentId provided" });
    }

    // 1) Update appointment and get the new document
    const appointment = await appointmentModel.findByIdAndUpdate(
      appointmentId,
      { status },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ success: false, message: "Appointment not found" });
    }

    // 2) Load the user who booked this appointment
    const user = await userModel.findById(appointment.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 3) Ensure the notifications array exists
    if (!Array.isArray(user.notification)) {
      user.notification = [];
    }

    // 4) Push the new notification
    user.notification.push({
      type: "status-updated",
      message: `Your appointment has been ${status}`,
      onClickPath: "/doctor-appointments",
      createdAt: new Date(),
    });

    // 5) Save back to the database
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Appointment status updated and user notified",
    });
  } catch (error) {
    console.error("Error in updateStatusController:", error);
    return res.status(500).json({
      success: false,
      message: "Error updating appointment status",
      error: error.message,
    });
  }
};
