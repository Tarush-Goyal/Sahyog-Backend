const mongoose2 = require("mongoose");
const uniqueValidator2 = require("mongoose-unique-validator");

const Schema2 = mongoose2.Schema;

const homeOwner = new Schema2({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  places: [{ type: mongoose2.Types.ObjectId, required: true, ref: "Place" }],
});

homeOwner.plugin(uniqueValidator2);
module.exports = mongoose2.model("HomeOwner", homeOwner);
