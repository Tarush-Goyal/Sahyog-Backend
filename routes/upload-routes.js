const express = require("express");

const upload = require("../middleware/mongodb-file-upload");
const uploadsController = require("../controllers/uploads-controllers");

const router = express.Router();

// router.get("/image/:filename", uploadsController.fetchImage);
router.get("/image", uploadsController.fetchAllImages);
router.get("/singleimage/:filename", uploadsController.fetchImage);
router.post("/storeimage", upload.single("file"), (req, res) => {});

module.exports = router;
