const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Item = require("../models/donationItem");
const HomeOwner = require("../models/homeowner");
const User = require("../models/user");
const homeowner = require("../models/homeowner");
const { use } = require("../routes/users-routes");

/*const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not find a place.",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new HttpError(
      "Could not find place for the provided id.",
      404
    );
    return next(error);
  }
  res.json({ place: place.toObject({ getters: true }) });
};*/

//itemspickedByVolunteerId

//donationsMadeByAparticularNgo

const getDonatedItemsByUserId = async (req, res, next) => {
  let user;
  let homeowner;
  let userWithItems;
  try {
    user = await User.findById(req.params.uid);
    homeowner = await HomeOwner.findOne({ email: user.email });
    userWithItems = homeowner.populate("items");
  } catch (err) {
    const error = new HttpError(
      "Fetching places failed, please try again later.",
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

const donateItem = async (req, res, next) => {
  console.log("wow");
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

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
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
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
    status: "active",
  });
  console.log(itemName);
  console.log(category);
  console.log(quantity);
  console.log(address);
  console.log(date);
  console.log(req.file.path);
  console.log(homeowner.id);
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await donatedItem.save({ session: sess });
    homeowner.items.push(donatedItem);
    await homeowner.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    console.log(err);
    const error = new HttpError(
      "Creating place failed, please try again.",
      500
    );
    return next(error);
  }

  res.status(201).json({ item: donatedItem });
};
/*
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }
  const { title, description } = req.body;
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  if (place.creator.toString() !== req.userData.userId) {
    const error = new HttpError("You are not allowed to edit this place.", 401);
    return next(error);
  }
  place.title = title;
  place.description = description;
  try {
    await place.save();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update place.",
      500
    );
    return next(error);
  }
  res.status(200).json({ place: place.toObject({ getters: true }) });
};
const deletePlace = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId).populate("creator");
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }
  if (!place) {
    const error = new HttpError("Could not find place for this id.", 404);
    return next(error);
  }
  if (place.creator.id !== req.userData.userId) {
    const error = new HttpError(
      "You are not allowed to delete this place.",
      401
    );
    return next(error);
  }
  const imagePath = place.image;
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await place.remove({ session: sess });
    place.creator.places.pull(place);
    await place.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not delete place.",
      500
    );
    return next(error);
  }
  fs.unlink(imagePath, (err) => {
    console.log(err);
  });
  res.status(200).json({ message: "Deleted place." });
};*/

//exports.getPlaceById = getPlaceById;
//exports.getPlacesByUserId = getPlacesByUserId;
exports.donateItem = donateItem;
exports.getDonatedItemsByUserId = getDonatedItemsByUserId;
//exports.updatePlace = updatePlace;
//exports.deletePlace = deletePlace;
