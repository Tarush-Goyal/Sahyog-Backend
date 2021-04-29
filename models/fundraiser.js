const mongoose = require("mongoose");
const Fundraiser = new mongoose.Schema({
  title: { type: String, required: true },
  desc: { type: String, required: true },
  goal: { type: String, required: true },
  imageGrid: { type: String },
  goalReached: { type: String },
});
module.exports = mongoose.model("fundraisers", Fundraiser);
