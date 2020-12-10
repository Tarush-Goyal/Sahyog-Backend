const express = require("express");
const { check } = require("express-validator");

const volunteerController = require("../controllers/volunteer-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get(
  "/volunteerLeaderBoard/:uid",
  volunteerController.volunteerLeaderBoard
);
router.get(
  "/itemsAcceptedByVolunteerId/:uid",
  volunteerController.itemsPickedByVolunteerId
);
router.get("/volunteerId/:uid", volunteerController.volunteerIdCard);
router.get("/activeDonationRequest", volunteerController.activeDonationRequest);
router.post("/acceptRequest", volunteerController.acceptDonationRequest);
router.post("/pickRequest/:uid", volunteerController.pickDonationRequest);

module.exports = router;
