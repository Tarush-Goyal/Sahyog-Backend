const express = require("express");
const { check } = require("express-validator");

const ngoheadController = require("../controllers/ngohead-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.post("/completeRequest", ngoheadController.completeDonationRequest);
router.get("/inventory/:uid", ngoheadController.ngoInventory);
router.get("/getVolunteers/:uid", ngoheadController.volunteersUnderNgo);

module.exports = router;
