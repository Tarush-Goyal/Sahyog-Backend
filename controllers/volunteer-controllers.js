const {validationResult} = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const HttpError = require("../models/http-error");
const User = require("../models/user");
const HomeOwner = require("../models/homeowner");
const Volunteer = require("../models/volunteer");
const NGOOwner = require("../models/ngohead");
const Item = require("../models/donationItem");
const mongoose = require("mongoose");

//active donation requests
const activeDonationRequest = async (req, res, next) => {
  let items;
  try {
    items = await Item.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching users failed, please try again later.",
      500
    );
    return next(error);
  }

  let filtered = [];
  items.forEach(x => {
    if (x.status == "Pending") filtered.push(x);
  });
  res.json({items: filtered});
};

//accept donation requests
const acceptDonationRequest = async (req, res, next) => {
  console.log("entered");
  const {_id, volunteerId} = req.body;
  let existingItem;
  let existingVolunteer;
  let existingUser;
  let ngo;
  let VolunteerId;
  try {
    existingItem = await Item.findById(_id);
    existingUser = await User.findById(volunteerId); //potential issue here
    existingVolunteer = await Volunteer.findOne({email: existingUser.email});
    ngo = await NGOOwner.findOne({nameNGO: existingVolunteer.nameNGO});
    VolunteerId = existingVolunteer.id;
    if (existingItem.status != "Pending") {
      const error = new HttpError(
        "Someone else has confirmed the donation.",
        404
      );
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }
  var num = Math.floor(Math.random() * (10000 - 1000) + 1000);
  existingItem.otp = num.toString();
  existingItem.status = "Active";
  existingItem.assignedVolunteer = VolunteerId;
  ngo.donationsAccepted=ngo.donationsAccepted+1;
  await ngo.donationsType.push(existingItem.category);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await existingItem.save({session: sess});
    await ngo.save({session:sess});
    await existingVolunteer.donationAccepted.push(existingItem);
    await existingVolunteer.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Something went wrong, could not update item status.",
      500
    );
    return next(error);
  }
  res.status(201).json({item: existingItem});
};

//pick donation request
const pickDonationRequest = async (req, res, next) => {
  const _id = req.params.uid;
  let existingItem;
  try {
    existingItem = await Item.findById(_id);
    if (existingItem.status != "Active") {
      const error = new HttpError(
        "Someone else has picked up the donation.",
        404
      );
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }
  existingItem.status = "Picked Up";
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await existingItem.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update item status.",
      500
    );
    return next(error);
  }
  res.status(201).json({item: existingItem});
};

//volunteer History
const itemsPickedByVolunteerId = async (req, res, next) => {
  const _id = req.params.uid;
  let user;
  let volunteerWithItems;
  try {
    user = await User.findById(_id);
    volunteerWithItems = await Volunteer.findOne({email: user.email}).populate({
      path: "donationAccepted",
      model: "Item",
      populate: {
        path: "userId",
        model: "HomeOwner"
      }
    });
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Fetching items failed, please try again later.",
      500
    );
    return next(error);
  }

  if (!volunteerWithItems || volunteerWithItems.donationAccepted.length === 0) {
    return next(
      new HttpError(
        "Could not find donated items for the provided user id.",
        404
      )
    );
  }
  res.json({
    items: volunteerWithItems.donationAccepted.map(item =>
      item.toObject({getters: true})
    )
  });
};

//volunteer LeaderBoard
const volunteerLeaderBoard = async (req, res, next) => {
  const _id = req.params.uid;
  let user;
  let volunteer;
  let volunteersUnderNGO;
  try {
    user = await User.findById(_id);
    volunteer = await Volunteer.findOne({email: user.email});
    console.log(volunteer.headNGO);
    volunteersUnderNGO = await NGOOwner.findById(volunteer.headNGO).populate({
      path: "volunteers",
      model: "Volunteer",
      match: {
        status: "Approved"
      },
      populate: {
        path: "donationAccepted",
        model: "Item",
        match: {
          status: "Picked Up"
        }
      }
    });
  } catch (error) {
    return next(error);
  }
  if (!volunteersUnderNGO || volunteersUnderNGO.volunteers.length == 0) {
    return next(new HttpError("There are no volunteers in your ngo.", 404));
  }

  res.json({
    items: volunteersUnderNGO.volunteers.map(item =>
      item.toObject({getters: true})
    )
  });
};

//volunteer IdCard
const volunteerIdCard = async (req, res, next) => {
  const _id = req.params.uid;
  let volunteer;
  try {
    volunteer = await Volunteer.findById(_id);
  } catch (err) {
    console.log(err);
    const error = new HttpError("There are no volunteers in your ngo.", 500);
    return next(error);
  }
  res.json(volunteer);
};

exports.activeDonationRequest = activeDonationRequest;
exports.acceptDonationRequest = acceptDonationRequest;
exports.pickDonationRequest = pickDonationRequest;
exports.itemsPickedByVolunteerId = itemsPickedByVolunteerId;
exports.volunteerIdCard = volunteerIdCard;
exports.volunteerLeaderBoard = volunteerLeaderBoard;
