const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

const upload = require("../middleware/mongodb-file-upload");

const router = express.Router();

router.get("/ngos", usersController.getNgoNames);
router.get("/emails", usersController.getEmails);
router.post("/test", usersController.test);

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

router.post("/login", usersController.login);

module.exports = router;
