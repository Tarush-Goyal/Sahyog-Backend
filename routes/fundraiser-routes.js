const express = require("express");
const fundraiserController = require("../controllers/fundraiser-controllers");
const router = express.Router();

router.post("/create", fundraiserController.createFundraiser);
router.get("/fetch", fundraiserController.fetchFundraisers);
router.get("/fetchfundraiser/:title", fundraiserController.fetchOneFundraiser);
router.post("/makepayment", fundraiserController.makePayment);

module.exports = router;
