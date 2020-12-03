const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", usersController.getUsers);

router.post(
  "/signup",
  fileUpload.single("image"),
  [
    check("firstName").not().isEmpty(),
    check("email").normalizeEmail().isEmail(),
    check("password").isLength({ min: 6 }),
  ],
  usersController.signup
);
router.get(
  "/itemsDonatedByUserId/:uid",
  usersController.getDonatedItemsByUserId
);
router.get("/activeDonationRequest", usersController.activeDonationRequest);
router.post("/acceptRequest", usersController.acceptDonationRequest);
router.post("/pickRequest", usersController.pickDonationRequest);
router.post("/completeRequest", usersController.completeDonationRequest);
router.post("/login", usersController.login);

module.exports = router;
