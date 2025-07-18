const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");

const getAllUsersController = async (req, res) => {
  try {
    const users = await userModel.find({});
    res.status(200).send({
      success: true,
      message: "users data list",
      data: users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while fetching users",
      error,
    });
  }
};

const getAllDoctorsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({});
    res.status(200).send({
      success: true,
      message: "Doctors Data list",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "error while getting doctors data",
      error,
    });
  }
};

//doctor account status
const changeAccountStatusController = async (req, res) => {
  try {
    const { doctorId, status } = req.body;

    // Update doctor status
    const doctor = await doctorModel.findByIdAndUpdate(doctorId, { status });

    // Find the associated user
    const user = await userModel.findOne({ _id: doctor.userId });

    // Push notification to the user
    const notification = user.notification;
    notification.push({
      type: 'doctor-account-request-updated',
      message: `Your Doctor Account Request Has ${status}`,
      onClickPath: '/notification',
    });

    // Update isDoctor flag based on status
    user.isDoctor = status === 'approved' ? true : false;

    // Save the updated user
    await user.save();

    res.status(201).send({
      success: true,
      message: "Account status updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: 'Error in Account Status',
      error,
    });
  }
};

module.exports = {
  getAllDoctorsController,
  getAllUsersController,changeAccountStatusController
};