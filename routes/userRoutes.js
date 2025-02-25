const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const roleAuth = require("../middleware/roleAuth");

// Authentication Routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/reset-password", userController.resetPassword);
router.put("/update-profile", auth, userController.updateProfile);

//User routes
router.get("/", auth, roleAuth(["user"]), userController.getUser);
router.get(
  "/appointments/:id",
  auth,
  roleAuth(["user"]),
  userController.getUserAppointments
);

router.delete("/:id", auth, roleAuth(["user"]), userController.deleteUser);
// Admin Routes
router.get("/admin", auth, roleAuth(["admin"]), (req, res) => {
  res.send("Welcome, admin!");
});
router.get(
  "/admin/users",
  auth,
  roleAuth(["admin"]),
  userController.getAllUsers
);
router.get(
  "/admin/user-stats",
  auth,
  roleAuth(["admin"]),
  userController.getUserStats
);

router.put(
  "/admin/users/:id/role",
  auth,
  roleAuth(["admin"]),
  userController.updateUserRole
);

module.exports = router;
