const express = require("express");
const { check } = require("express-validator");

const homeownerController = require("../controllers/homeowner-controllers");
const fileUpload = require("../middleware/file-upload");

const router = express.Router();

router.get("/", homeownerController.getUsers);
router.get(
  "/itemsDonatedByUserId/:uid",
  homeownerController.getDonatedItemsByUserId
);
router.get("/homeownerId/:uid", homeownerController.HomeOwnerIdCard);
