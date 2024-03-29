const mongoose4 = require("mongoose");
const uniqueValidator4 = require("mongoose-unique-validator");
const Schema4 = mongoose4.Schema;

const ngoOwner = new Schema4({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  nameNGO: { type: String, required: true },
  descriptionNGO: { type: String, required: true },
  donationsAccepted: {type: Number, required: true},
  donationsCompleted: {type: Number, required: true},
  donationsType: {type: Array, required: true},
  volunteers: [{ type: mongoose4.Types.ObjectId, ref: "Volunteer" }],
  imageGrid: { type: String },
  preferred: {type:String},
});
ngoOwner.plugin(uniqueValidator4);
module.exports = mongoose4.model("NGOOwner", ngoOwner);
