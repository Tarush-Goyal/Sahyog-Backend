const Fundraiser = require("../models/fundraiser");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");

const createFundraiser = async (req, res, next) => {
  console.log(req.body);

  const { title, desc, goal, imageGrid } = req.body;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError("Invalid inputs passed, please check your data.", 422)
    );
  }

  const fundraiser = new Fundraiser({
    title: title,
    desc,
    goal,
    imageGrid,
  });

  try {
    fundraiser.save();
  } catch (err) {
    const error = new HttpError(err, 422);
    return next(error);
  }
  res.status(201).json({ item: fundraiser });
};

exports.createFundraiser = createFundraiser;
