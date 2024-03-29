const Fundraiser = require("../models/fundraiser");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const HttpError = require("../models/http-error");
const { v4: uuidv4 } = require("uuid");
const fundraiser = require("../models/fundraiser");
const stripe = require("stripe")(
  "sk_test_51IgnbRSEzonCch7wJInwftRpuQdSKUWHgzbVmzWwPwvg2RSYwJgsuX1zu8XxTr8ZAZg4KdcbQM7nZENH0MPTcMdG000dwBzVvy"
);

const makePayment = async (req, res, next) => {
  const end = req.body.end;
  const price = req.body.price;
  const fundraiserName = req.body.product.title;
  let updatedFundraiser;
  if (end) {
    try {
      await Fundraiser.deleteOne({ title: fundraiserName });
      console.log("fundraiser deleted");
    } catch (err) {
      const error = new HttpError("could not delete fundraiser", 503);
      return next(error);
    }
  } else {
    try {
      console.log("fundraiser not deleted");
      updatedFundraiser = await Fundraiser.findOneAndUpdate(
        { title: fundraiserName },
        { goalReached: price }
      );
    } catch (err) {
      const error = new HttpError("could not update fundraiser", 503);
      return next(error);
    }
  }
  console.log(updatedFundraiser);
};

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
    goalReached: 0,
  });

  try {
    fundraiser.save();
  } catch (err) {
    const error = new HttpError(err, 422);
    return next(error);
  }
  res.status(201).json({ item: fundraiser });
};

const fetchFundraisers = async (req, res, next) => {
  let fundraisers;
  try {
    fundraisers = await Fundraiser.find({});
  } catch (err) {
    const error = new HttpError(
      "Fetching fundraisers failed, please try again later.",
      500
    );
    return next(error);
  }
  res.json({
    fundraisers: fundraisers.map((fund) => fund.toObject({ getters: true })),
  });
};

const fetchOneFundraiser = async (req, res, next) => {
  // const title = req.params.title;
  // console.log(title);
  let fundraiser;
  try {
    fundraiser = await Fundraiser.find({ title: req.params.title });
  } catch (err) {
    const error = new HttpError("Fundraiser not found", 404);
    return next(error);
  }
  res.json({
    fundraisers: fundraiser,
  });
};

exports.fetchOneFundraiser = fetchOneFundraiser;
exports.fetchFundraisers = fetchFundraisers;
exports.createFundraiser = createFundraiser;
exports.makePayment = makePayment;
