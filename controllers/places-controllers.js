const fs = require("fs");

const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/http-error");
const getCoordsForAddress = require("../util/location");
const Item = require("../models/donationItem");
const HomeOwner = require("../models/homeowner");
const User = require("../models/user");
const NGOOwner = require("../models/ngohead");
const { use } = require("../routes/users-routes");
const ngohead = require("../models/ngohead");

/*const donationsMadeByNgo = async (req, res, next) => {
  let user;
  let volunteersunderNGO;
  let ngoHead;
  try {
    user = await User.findById(req.params.uid);
    ngoHead = await NGOOwner.findOne({ email: user.email });
    volunteersunderNGO = ngoHead.populate("volunteers");
  } catch (err) {
    const error = new HttpError("Something went wrong. Please try again.", 500);
    return next(error);
  }
  if (!volunteersunderNGO || volunteersunderNGO.volunteers.length === 0) {
    return next(new HttpError("There is no donations made by your NGO.", 404));
  }
  let donations;
  volunteersUnderNGO.volunteers.forEach((v)=>{
      let volunteerWithItems;
      let volunteer;
      volunteer = await Volunteer.findById(v.id);
      volunteerWithItems = volunteer.populate("donationAccepted");
      volunteerWithItems.donationAccepted.forEach((item)=>{
        donations.push(item);
      });
  });
  res.json(donations);
  
};*/

//Signed in, Ngo head, All the pickedup items by volunteers of that ngo.
//LeaderBoard of ngo volunteers, for that particular NGO. volunteer is signed in.

/*const volunteerLeaderBoard = async(req,res,next) => {
  const { _id } = req.body;
  let user;
  let volunteer;
  let ngoHead;
  let ngoOwner;
  try {
    user = await User.findById(_id);
    volunteer = await Volunteer.findOne({ email: user.email });
    ngoOwner=volunteer.headNGO;
    ngohead=await Volunteer.findById(ngoOwner);
    volunteersunderNGO = ngoHead.populate("volunteers");
  } catch (err) {
    const error = new HttpError("Something went wrong. Please try again.", 500);
    return next(error);
  }
  if (!volunteersunderNGO || volunteersunderNGO.volunteers.length === 0) {
    return next(
      new HttpError("There is no current Volunteer in this NGO", 404)
    );
  }
  let lboard;
  volunteersUnderNGO.volunteers.forEach((v)=>{
      let volunteerWithItems;
      let volunteer;
      volunteer = await Volunteer.findById(v.id);
      volunteerWithItems = volunteer.populate("donationAccepted");
      volunteerWithItems.donationAccepted.forEach((item)=>{
        donations.push(item);
      });
  });
  
}*/
const volunteersUnderNgo = async (req, res, next) => {
  const { _id } = req.body;
  let user;
  let volunteersunderNGO;
  let ngoHead;
  try {
    user = await User.findById(_id);
    ngoHead = await NGOOwner.findOne({ email: user.email });
    volunteersunderNGO = ngoHead.populate("volunteers");
  } catch (err) {
    const error = new HttpError("Something went wrong. Please try again.", 500);
    return next(error);
  }
  if (!volunteersunderNGO || volunteersunderNGO.volunteers.length === 0) {
    return next(
      new HttpError("There is no current Volunteer in this NGO", 404)
    );
  }
  res.json({
    items: volunteersunderNGO.volunteers.map((item) =>
      item.toObject({ getters: true })
    ),
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
exports.donateItem = donateItem;
exports.volunteersUnderNgo = volunteersUnderNgo;
