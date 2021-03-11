const express = require("express");
const { check } = require("express-validator");

const usersController = require("../controllers/users-controllers");
const fileUpload = require("../middleware/file-upload");

const upload = require("../middleware/mongodb-file-upload");

const router = express.Router();

// router.post("/signup", upload.single("image"), (req, res) => {
//   // res.json({ file: req.file });
//   res.redirect("/");
// });
router.post("/upload", upload.single("file"), (req, res) => {});
// router.post(
//   "/signup",
//   upload.single("image"),
//   [
//     check("firstName").not().isEmpty(),
//     check("email").normalizeEmail().isEmail(),
//     check("password").isLength({ min: 6 }),
//   ],
//   usersController.signup
// );

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
