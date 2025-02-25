const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { Op } = require("sequelize");
const sequelize = require("../database/db");
const Appointment = require("../models/Appointment");
// const { deleteAppointment } = require("./appointmentController");

//Get User
const getUser = async (req, res) => {
  console.log("Fetching user");
  try {
    const authToken = req.headers.authorization;
    const token = authToken.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded.id;

    const user = await User.findByPk(id);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: `Server error occurred : ${error.message}` });
  }
};
const getUserAppointments = async (req, res) => {
  console.log("Fetching user appointments");
  try {
    const { id } = req.params;
    console.log("The id is ", id);
    const appointments = await Appointment.findAll({
      where: { userId: id },
    });
    console.log("The appointments are ", appointments);
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching user appointments:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};
// Register User
const registerUser = async (req, res) => {
  console.log("Registering user");
  const { fullname, email, phone_number, username, password, role } = req.body;
  console.log("The request body is ", req.body);
  if (!fullname || !email || !phone_number || !username || !password) {
    return res.status(400).json({
      error: "Please insert all required fields",
    });
  }

  try {
    const checkExistingUser = await User.findOne({
      where: {
        [Op.or]: [{ username: username }, { email: email }],
      },
    });

    if (checkExistingUser) {
      return res.status(400).json({
        error: "Username or email already exists",
      });
    }

    const saltRound = 10;
    const hashpassword = await bcrypt.hash(password, saltRound);

    const newUser = await User.create({
      fullname,
      email,
      phone_number,
      username,
      password: hashpassword,
      role: role || "user", // Default to 'user' if not specified
    });

    const token = jwt.sign(
      { id: newUser.id, username: newUser.username, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: "Registration Successful",
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  console.log("Login attempt:", { email, password });

  try {
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    console.log("Password check result:", isPasswordValid);

    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({ token, role: user.role });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { username, newPassword } = req.body;

  try {
    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const saltRound = 10;
    const hashpassword = await bcrypt.hash(newPassword, saltRound);

    await user.update({ password: hashpassword });

    res.json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Update Profile
const updateProfile = async (req, res) => {
  const { id } = req.user; // From auth middleware
  const { fullname, email, phone_number, currentPassword, newPassword } =
    req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // If updating password
    if (currentPassword && newPassword) {
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isPasswordValid) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const saltRound = 10;
      const hashpassword = await bcrypt.hash(newPassword, saltRound);
      user.password = hashpassword;
    }

    if (fullname) user.fullname = fullname;
    if (email) user.email = email;
    if (phone_number) user.phone_number = phone_number;

    await user.save();

    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Get All Users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "id",
        "fullname",
        "email",
        "phone_number",
        "username",
        "role",
        "createdAt",
      ],
      order: [["createdAt", "DESC"]],
    });
    const filteredUsers = users.filter((user) => user.role !== "admin");
    //filtering so that only the user roles are sent. Not the admin role
    res.json(filteredUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Get User Statistics (Admin only)
const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const newUsersThisMonth = await User.count({
      where: {
        createdAt: {
          [Op.gte]: new Date(new Date().setDate(1)), // First day of current month
        },
      },
    });
    const usersByRole = await User.findAll({
      attributes: [
        "role",
        [sequelize.fn("count", sequelize.col("role")), "count"],
      ],
      group: ["role"],
    });

    res.json({
      totalUsers,
      newUsersThisMonth,
      usersByRole,
    });
  } catch (error) {
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Delete User (Admin only)
const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return res
          .status(400)
          .json({ error: "Cannot delete the last admin user" });
      }
    }

    await user.destroy();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Update User Role (Admin only)
const updateUserRole = async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  try {
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Prevent removing the last admin
    if (user.role === "admin" && role !== "admin") {
      const adminCount = await User.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return res.status(400).json({ error: "Cannot remove the last admin" });
      }
    }

    user.role = role;
    await user.save();

    res.json({ message: "User role updated successfully" });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUser,
  getUserAppointments,
  resetPassword,
  updateProfile,
  getAllUsers,
  getUserStats,
  deleteUser,
  updateUserRole,
};
