const express = require("express");
const router = express.Router();
const serviceController = require("../controllers/serviceController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Service Routes
router.post("/", auth, roleAuth(["admin"]), serviceController.createService);
router.get("/", auth, serviceController.getAllServices);
router.get("/:id", auth, serviceController.getServiceById);
router.put("/:id", auth, roleAuth(["admin"]), serviceController.updateService);
router.delete("/:id", auth, roleAuth(["admin"]), serviceController.deleteService);

module.exports = router;