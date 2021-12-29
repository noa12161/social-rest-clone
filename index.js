const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");

dotenv.config();

mongoose.connect(process.env.MONGO_URL, () => {
  console.log("connected to mogoDB");
});

//middleware

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// userRoute 의 기본경로:/api/users
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);

app.listen(8800, () => {
  console.log("backend server is running");
});
