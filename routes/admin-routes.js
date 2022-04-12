const express = require("express");
const adminController = require("../controllers/admin-controllers");
const router = express.Router();

router.get("/getNGOs", adminController.getNGOs);
router.get("/getNGODetails/:id", adminController.getNGODetails);
router.post("/updatePreferredType", adminController.updatePreferredType);
router.get("/sendPreferred/:name",adminController.sendPreferred);

module.exports = router;
