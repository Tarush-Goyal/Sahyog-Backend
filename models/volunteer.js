const mongoose3 = require("mongoose");
const uniqueValidator3 = require("mongoose-unique-validator");
const Schema3 = mongoose3.Schema;

const volunteer = new Schema3({
  image: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  nameNGO: { type: String, required: true },
});
volunteer.plugin(uniqueValidator3);
module.exports = mongoose3.model("Volunteer", volunteer);
