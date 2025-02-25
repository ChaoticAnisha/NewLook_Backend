const express = require("express");
const router = express.Router();
const appointmentController = require("../controllers/appointmentController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Appointment Routes
router.post("/", auth, appointmentController.createAppointment);
router.get(
  "/",
  auth,
  roleAuth(["admin"]),
  appointmentController.getAllAppointments
);
router.get("/:id", auth, appointmentController.getAppointmentById);
router.put("/:id", auth, appointmentController.updateAppointment);
router.delete("/:id", auth, appointmentController.deleteAppointment);

module.exports = router;
