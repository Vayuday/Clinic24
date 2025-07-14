const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    console.log("process.env.MONGO_URL =", process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected @ ${mongoose.connection.host}`.bgGreen.white);
  } catch (error) {
    console.log(`MongoDB connection error: ${error}`.bgRed.white);
  }
};

module.exports = connectDB;

