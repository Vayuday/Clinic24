// routes/adminRoutes.js
const express = require("express");
const {
  getAllUsersController,
  getAllDoctorsController,
  changeAccountStatusController,
} = require("../controllers/adminCtrl");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

// GET all users
router.get("/getAllUsers",    authMiddleware, getAllUsersController);

// GET all doctors
router.get("/getAllDoctors",  authMiddleware, getAllDoctorsController);

// POST to change status
router.post(
  "/changeDoctorStatus",     // <— path matching your axios call
  authMiddleware,
  changeAccountStatusController
);

module.exports = router;
