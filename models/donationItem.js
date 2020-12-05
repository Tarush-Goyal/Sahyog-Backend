const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const itemSchema = new Schema({
  itemName: { type: String, required: true },
  category: { type: String, required: true },
  quantity: { type: String, required: true },
  address: {
    street: { type: String, required: true },
    landmark: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    house: { type: String, required: true },
  },
  date: { type: String, required: true },
  image: { type: String, required: true },
  userId: { type: mongoose.Types.ObjectId, required: true, ref: "HomeOwner" },
  status: { type: String, required: true },
  assignedVolunteer: {
    type: mongoose.Types.ObjectId,
    ref: "Volunteer",
    default: undefined,
  },
  otp: {
    type: String,
    default: undefined,
  },
});

module.exports = mongoose.model("Item", itemSchema);
