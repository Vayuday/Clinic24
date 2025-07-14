// routes/userRoutes.js

const express = require("express");
const authMiddleware = require("../middlewares/authMiddleware");
const {
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
} = require("../controllers/userCtrl");

const router = express.Router();

router.post("/register", registerController);
router.post("/login", loginController);
router.post("/getUserData", authMiddleware, authController);

router.post("/apply-doctor", authMiddleware, applyDoctorController);
router.post("/getAllDoctors", authMiddleware, getAllDoctorsController);

router.post("/booking-availability", authMiddleware, bookingAvailabilityController);
router.post("/book-appointment",   authMiddleware, bookAppointmentController);
router.post("/user-appointments",  authMiddleware, userAppointmentsController);

// NEW: notifications
router.post("/get-all-notification",   authMiddleware, getAllNotificationController);
router.post("/delete-all-notification", authMiddleware, deleteAllNotificationController);

module.exports = router;
