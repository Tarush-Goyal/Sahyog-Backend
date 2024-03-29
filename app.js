const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const uploadRoutes = require("./routes/upload-routes");
const usersRoutes = require("./routes/users-routes");
const homeownerRoutes = require("./routes/homeowner-routes");
const volunteerRoutes = require("./routes/volunteer-routes");
const ngoheadRoutes = require("./routes/ngohead-routes");
const fundraiserRoutes = require("./routes/fundraiser-routes");
const adminRoutes = require("./routes/admin-routes");
const upload = require("./middleware/mongodb-file-upload");
const HttpError = require("./models/http-error");
const cors = require("cors");

const app = express();

app.use(bodyParser.json({ limit: "30mb", extended: true }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api/uploads", uploadRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/homeowner", homeownerRoutes);
app.use("/api/volunteer", volunteerRoutes);
app.use("/api/ngohead", ngoheadRoutes);
app.use("/api/fundraiser", fundraiserRoutes);
app.use("/api/admin",adminRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    // `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@sahyog.stq6x.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`
   // `mongodb+srv://SahyogAdmin:3wDezU0CHVapQUVv@sahyog.upfyh.mongodb.net/Sahyog?retryWrites=true&w=majority`
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@sahyog.upfyh.mongodb.net/Sahyog?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(process.env.PORT || 5000);
  })
  .catch((err) => {
    console.log(err);
  });
