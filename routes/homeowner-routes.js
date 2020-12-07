const express = require("express");
const { check } = require("express-validator");

const homeownerController = require("../controllers/homeowner-controllers");
const fileUpload = require("../middleware/file-upload");
const checkAuth = require("../middleware/check-auth");

const router = express.Router();

router.get("/", homeownerController.getUsers);
router.get(
  "/itemsDonatedByUserId/:uid",
  homeownerController.getDonatedItemsByUserId
);
router.get("/homeownerId/:uid", homeownerController.HomeOwnerIdCard);

router.use(checkAuth);
router.post(
  "/donateItem",
  fileUpload.single("image"),
  homeownerController.donateItem
);

module.exports = router;
