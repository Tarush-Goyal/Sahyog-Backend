const mongoose = require("mongoose");
// const uniqueValidator = require("mongoose-unique-validator");
const Fundraiser = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  goal: { type: String, required: true },
  imageGrid: { type: String },
});
// Fundraiser.plugin(uniqueValidator);
module.exports = mongoose.model("fundraisers", Fundraiser);
