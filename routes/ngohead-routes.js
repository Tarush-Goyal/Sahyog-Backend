const express = require("express");
const { check } = require("express-validator");

const ngoheadController = require("../controllers/ngohead-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.post("/completeRequest", ngoheadController.completeDonationRequest);
router.get("/inventory/:uid", ngoheadController.ngoInventory);
router.get("/getVolunteers/:uid", ngoheadController.volunteersUnderNgo);
router.get(
  "/volunteersNotApproved/:uid",
  ngoheadController.volunteersNotApproved
);
router.post("/approveVolunteer/:uid", ngoheadController.approveVolunteer);
router.post("/declineVolunteer/:uid", ngoheadController.declineVolunteer);

module.exports = router;
