const HttpError = require("../models/http-error");
const User = require("../models/user");

const Volunteer = require("../models/volunteer");
const NGOOwner = require("../models/ngohead");
const Item = require("../models/donationItem");
const mongoose = require("mongoose");

//Complete donation
const completeDonationRequest = async (req, res, next) => {
  const {_id, quantity, user_id} = req.body;
  let existingItem;
  let existingUser;
  let ngo;
  let dc;
  try {
    existingItem = await Item.findById(_id);
    existingUser = await User.findById(user_id);
    ngo = await NGOOwner.find({email: existingUser.email});
    if (existingItem.status != "Picked Up") {
      const error = new HttpError("Error 404.", 404);
      return next(error);
    }
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, please try again later.",
      500
    );
    return next(error);
  }
  existingItem.quantity = quantity;
  if (quantity == "0") {
    existingItem.status = "Completed";
    try {
      await NGOOwner.updateOne(
        {email: existingUser.email},
        {$inc: {donationsCompleted: 1}}
      );
    } catch (err) {
      const error = new HttpError(
        "Something went wrong, could not update ngo status.",
        500
      );
      return next(error);
    }
  }
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

//History of Ngo
const ngoHistory = async (req, res, next) => {
  const _id = req.params.uid;
  let user;
  let volunteersUnderNGO;
  try {
    user = await User.findById(_id);
    volunteersUnderNGO = await NGOOwner.findOne({email: user.email}).populate({
      path: "volunteers",
      model: "Volunteer",
      match: {
        status: "Approved"
      },
      populate: {
        path: "donationAccepted",
        model: "Item"
      }
    });
  } catch (err) {
    return next(err);
  }
  if (!volunteersUnderNGO || volunteersUnderNGO.volunteers.length == 0) {
    return next(
      new HttpError("There are no current volunteers in your NGO.", 404)
    );
  }
  let ans = [];
  volunteersunderNGO.volunteers.forEach(v => {
    v.donationAccepted.forEach(i => {
      ans.push(i);
    });
  });
  res.json({items: ans});
};

//NGO inventory
const ngoInventory = async (req, res, next) => {
  const _id = req.params.uid;
  let user;
  let volunteersUnderNGO;
  try {
    user = await User.findById(_id);
    volunteersUnderNGO = await NGOOwner.findOne({email: user.email}).populate({
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
  } catch (err) {
    return next(err);
  }
  if (!volunteersUnderNGO || volunteersUnderNGO.volunteers.length === 0) {
    return next(
      new HttpError("There are no current volunteers in your NGO.", 404)
    );
  }
  let ans = [];
  volunteersUnderNGO.volunteers.forEach(v => {
    v.donationAccepted.forEach(i => {
      ans.push(i);
    });
  });
  res.json({items: ans});
};

//Volunteers under Ngo
const volunteersUnderNgo = async (req, res, next) => {
  const _id = req.params.uid;
  let user;
  let volunteersunderNGO;
  try {
    user = await User.findById(_id);
    volunteersunderNGO = await NGOOwner.findOne({
      email: user.email
    }).populate({
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
  } catch (err) {
    const error = new HttpError("Something went wrong. Please try again.", 500);
    return next(error);
  }
  if (!volunteersunderNGO || volunteersunderNGO.volunteers.length == 0) {
    return next(
      new HttpError("There is no current Volunteer in this NGO", 404)
    );
  }

  res.json({
    items: volunteersunderNGO.volunteers.map(item =>
      item.toObject({getters: true})
    )
  });
};

const volunteersNotApproved = async (req, res, next) => {
  const _id = req.params.uid;
  let user;
  let volunteersunderNGO;
  try {
    user = await User.findById(_id);
    volunteersunderNGO = await NGOOwner.findOne({email: user.email}).populate({
      path: "volunteers",
      model: "Volunteer",
      match: {
        status: "Not Approved"
      }
    });
  } catch (err) {
    const error = new HttpError("Something went wrong. Please try again.", 500);
    return next(error);
  }
  if (!volunteersunderNGO || volunteersunderNGO.volunteers.length == 0) {
    return next(
      new HttpError("There is no current Volunteer in this NGO", 404)
    );
  }

  res.json({
    items: volunteersunderNGO.volunteers.map(item =>
      item.toObject({getters: true})
    )
  });
};

const approveOrDeclineVolunteer = async (req, res, next) => {
  const {_id, approve} = req.body;
  let volunteer;
  try {
    volunteer = await Volunteer.findById(_id);
    if (approve) {
      volunteer.status = "Approved";
    } else {
      volunteer.status = "Declined";
    }
  } catch (err) {
    const error = new HttpError("Something went wrong. Please try again.", 500);
    return next(error);
  }
  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await volunteer.save({session: sess});
    await sess.commitTransaction();
  } catch (err) {
    const error = new HttpError(
      "Something went wrong, could not update volunteer status.",
      500
    );
    return next(error);
  }
  res.status(201).json({item: volunteer});
};

exports.completeDonationRequest = completeDonationRequest;
exports.ngoInventory = ngoInventory;
exports.volunteersUnderNgo = volunteersUnderNgo;
exports.volunteersNotApproved = volunteersNotApproved;
exports.approveOrDeclineVolunteer = approveOrDeclineVolunteer;
