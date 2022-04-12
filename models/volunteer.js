const mongoose3 = require("mongoose");
const uniqueValidator3 = require("mongoose-unique-validator");
const Schema3 = mongoose3.Schema;

const volunteer = new Schema3({
  image: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nameNGO: { type: String, required: true },
  approval: {type: String, required: true},
  headNGO: { type: mongoose3.Types.ObjectId, required: true, ref: "NGOOwner" },
  donationAccepted: [
    { type: mongoose3.Types.ObjectId, required: true, ref: "Item" },
  ],
  imageGrid: { type: String },
});
volunteer.plugin(uniqueValidator3);
module.exports = mongoose3.model("Volunteer", volunteer);
