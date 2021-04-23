const express = require("express");
const fundraiserController = require("../controllers/fundraiser-controllers");
const router = express.Router();

router.post("/create", fundraiserController.createFundraiser);

module.exports = router;
