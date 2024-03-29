const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const HomeOwner = require("../models/homeowner");
const Volunteer = require("../models/volunteer");
const NGOOwner = require("../models/ngohead");
const Item = require("../models/donationItem");
const mongoose = require("mongoose");

const signup = async (req, res, next) => {
  try {
    const {
      email,
      firstName,
      lastName,
      password,
      nameNGO,
      descriptionNGO,
      date,
      type,
      image,
      imageGrid,
    } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return next(
        new HttpError("Invalid inputs passed, please check your data.", 422)
      );
    }

    let existingUser;
    let check;
    try {
      existingUser = await User.findOne({ email: email });
    } catch (err) {
      const error = new HttpError(
        "Signing up failed, please try again later.",
        500
      );
      return next(error);
    }

    if (existingUser) {
      const error = new HttpError(
        "User exists already, please login instead.",
        422
      );
      return next(error);
    }

    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 12);
    } catch (err) {
      const error = new HttpError(
        "Could not create user, please try again.",
        500
      );
      return next(error);
    }
    if (type == "volunteer") {
      try {
        check = await NGOOwner.findOne({ nameNGO: nameNGO });
      } catch (err) {
        const error = new HttpError(
          "Signing up failed, please try again later.",
          500
        );
        return next(error);
      }
      if (!check) {
        const error = new HttpError("No Such NGO Exists.", 422);
        return next(error);
      }
    }
    var fname = firstName;
    var middle = " ";
    var lname = lastName;
    var name = fname.concat(middle, lname);
    const createdUser = new User({
      email,
      password: hashedPassword,
      type,
      date,
    });
    var createdUser2;
    if (type == "homeowner") {
      createdUser2 = new HomeOwner({
        email,
        name,
        image: req.file.path,
        imageGrid: imageGrid,
      });
    } else if (type == "head") {
      createdUser2 = new NGOOwner({
        email,
        name,
        image: req.file.path,
        nameNGO,
        descriptionNGO: descriptionNGO,
        donationsAccepted: 0,
        donationsCompleted: 0,
        donationsType: [],
        imageGrid: imageGrid,
      });
    } else if (type == "volunteer") {
      const url = req.file.path;
      createdUser2 = new Volunteer({
        image: url,
        email: email,
        name: name,
        nameNGO: nameNGO,
        headNGO: check.id,
        approval: "pending",
        imageGrid: imageGrid,
      });
    }
    try {
      const sess = await mongoose.startSession();
      sess.startTransaction();
      await createdUser.save({ session: sess });
      await createdUser2.save({ session: sess });
      if (check) {
        await check.volunteers.push(createdUser2);
        await check.save({ session: sess });
      }
      await sess.commitTransaction();
    } catch (err) {
      console.log(err);
      const error = new HttpError(
        "Signing up failed, please try again later.",
        500
      );
      return next(error);
    }

    let token;
    try {
      // if (type == "volunteer") {
      //   return next(
      //     new HttpError("Wait until your NGO Head approves you.", 404)
      //   );
      // }
      token = jwt.sign(
        { userId: createdUser.id, email: createdUser.email },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
    } catch (err) {
      const error = new HttpError(
        "Signing up failed, please try again later.",
        500
      );
      return next(error);
    }

    let signupDetails;

    if (type == "volunteer") {
      let newVolunteer = await Volunteer.findOne({
        email: email,
      });
      signupDetails={
        userId: newVolunteer._id,
        email: newVolunteer.email,
        token: token,
        type: type,
      }
    }else{
      signupDetails={
      userId: createdUser.id,
      email: createdUser.email,
      token: token,
      type: createdUser.type,
    }
    }

    res.status(201).json(signupDetails);
  } catch (err) {
    console.log(err);
    return next(HttpError(err));
  }
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let existingUser;
  if(email=='admin@sahyog.com' && password=='password'){
    token = jwt.sign(
      { userId: 'admin', email: email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );

    res.json({
      userId: 'admin',
      email: email,
      token: token,
      type: 'admin',
    });
  } else {

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!existingUser) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials and try again.",
      500
    );
    return next(error);
  }

  if (!isValidPassword) {
    const error = new HttpError(
      "Invalid credentials, could not log you in.",
      403
    );
    return next(error);
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, email: existingUser.email },
      process.env.JWT_KEY,
      { expiresIn: "1h" }
    );
  } catch (err) {
    const error = new HttpError(
      "Logging in failed, please try again later.",
      500
    );
    return next(error);
  }

  let loginDetails;
  if (existingUser.type == "volunteer") {
    let existingVolunteer = await Volunteer.findOne({
      email: existingUser.email,
    });
    loginDetails={
      userId: existingVolunteer.id,
      email: existingVolunteer.email,
      token: token,
      type: existingUser.type,
    }
    // if (existingVolunteer.status == "Not Approved") {
    //   return next(
    //     new HttpError("Wait until your NGO Head approves you.", 404)
    //   );
    // }
    // if (existingVolunteer.status == "Declined") {
    //   return next(new HttpError("NGO HEAD has declined you.", 404));
    // }
  }else{
  loginDetails={
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
    type: existingUser.type,
  }
}
  console.log(loginDetails)
  res.json(loginDetails);

  }
};

const getNgoNames = async (req, res, next) => {
  let ngos;
  try {
    ngos = await NGOOwner.find({});
    console.log(ngos);
  } catch (err) {
    const error = new HttpError("could not find ngos", 404);
    return next(error);
  }
  res.json({
    ngos: ngos.map((ngo) => ngo.toObject({ getters: true })),
  });
};

const getEmails = async (req, res, next) => {
  let users;
  try {
    users = await User.find({});
    console.log(users);
  } catch (err) {
    const error = new HttpError("could not find users", 404);
    return next(error);
  }
  res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const test = async (req, res) => {
  console.log("HALLEJULLAH 3");
  let users;
  try {
    users = await User.findOneAndUpdate(
      { type: "test" },
      { type: "homeowner" }
    );
    console.log(users);
  } catch (err) {
    console.log(err);
  }
};

exports.signup = signup;
exports.login = login;
exports.getNgoNames = getNgoNames;
exports.getEmails = getEmails;
exports.test = test;
