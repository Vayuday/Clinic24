const express = require('express')
const authMiddleware = require('../middlewares/authMiddleware')
const { getDoctorInfoController, updateProfileController, getDoctorByIdController, doctorAppointmentsController, updateStatusController } = require('../controllers/doctorCtrl')
const router = express.Router()

//POST SINGLE DOC INFO
router.post('/getDoctorInfo',authMiddleware,getDoctorInfoController);

//POST UPDATE PROFILE
router.post('/updateProfile',authMiddleware, updateProfileController);

router.post('/getDoctorById',authMiddleware, getDoctorByIdController);

router.post(
  "/doctor-appointments",
  authMiddleware,
  doctorAppointmentsController
);

//POST Update Status
router.post("/update-status", authMiddleware, updateStatusController);
module.exports= router;