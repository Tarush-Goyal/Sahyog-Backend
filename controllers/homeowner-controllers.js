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

//HomeOwner leaderboard
const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await HomeOwner.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );

    return next(error);
  }
  res.json({ users: users.map((user) => user.toObject({ getters: true })) });
};

//HomeOwner history
const getDonatedItemsByUserId = async (req, res, next) => {
  const _id = req.params.uid;
  let user;
  let userWithItems;
  try {
    user = await User.findById(_id);
    userWithItems = await HomeOwner.findOne({ email: user.email }).populate(
      "items"
    );
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Fetching items failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!userWithItems || userWithItems.items.length === 0) {
    return next(
      new HttpError(
        "Could not find donated items for the provided user id.",
        404
      )
    );
  }
  res.json({
    items: userWithItems.items.map((item) => item.toObject({ getters: true })),
  });
};

//HomeOwner id card
const HomeOwnerIdCard = async (req, res, next) => {
  const _id = req.params.uid;
  let user;
  let homeowner;
  try {
    user = await User.findById(_id);
    homeowner = HomeOwner.findOne({ email: user.email });
  } catch (err) {
    console.log(err);
    const error = new HttpError("Error something went wrong.", 500);
    return next(error);
  }
  res.json({ items: homeowner });
};

//Donate Item
const donateItem = async (req, res, next) => {
  const {
    itemName,
    category,
    quantity,
    street,
    landmark,
    city,
    state,
    pincode,
    house,
    date,
    image,
  } = req.body;

  const address = {
    street: street,
    landmark: landmark,
    city: city,
    state: state,
    pincode: pincode,
    house: house,
  };

  let user;
  let homeowner;
  try {
    user = await User.findById(req.userData.userId);
    homeowner = await HomeOwner.findOne({ email: user.email });
  } catch (err) {
    const error = new HttpError("Creating Item failed, please try again.", 500);
    return next(error);
  }

  if (!user) {
    const error = new HttpError("Could not find user for provided id.", 404);
    return next(error);
  }

  const donatedItem = new Item({
    itemName: itemName,
    category: category,
    quantity: quantity,
    address: address,
    date: date,
    image: req.file.path,
    userId: homeowner.id,
    status: "Pending",
  });

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await donatedItem.save({ session: sess });
    homeowner.items.push(donatedItem);
    await homeowner.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError("Creating item failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ item: donatedItem });
};

exports.donateItem = donateItem;
exports.getUsers = getUsers;
exports.getDonatedItemsByUserId = getDonatedItemsByUserId;
exports.HomeOwnerIdCard = HomeOwnerIdCard;
