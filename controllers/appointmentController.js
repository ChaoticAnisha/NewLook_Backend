const Appointment = require("../models/Appointment");
const { Op } = require("sequelize");

// Create Appointment
const createAppointment = async (req, res) => {
  console.log("Executing createAppointment");
  const { name, email, phoneNumber, date, category } = req.body;
  const userId = req.user.id;

  try {
    // Check for existing appointments in the same time slot
    const existingAppointment = await Appointment.findOne({
      where: {
        date: date,
        status: {
          [Op.ne]: "cancelled",
        },
      },
    });

    if (existingAppointment) {
      return res.status(409).json({ error: "Time slot is already booked" });
    }

    const newAppointment = await Appointment.create({
      userId,
      name,
      email,
      phoneNumber,
      date,
      category,
    });

    res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Get All Appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll({
      order: [["date", "DESC"]],
    });
    res.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Get Appointment by ID
const getAppointmentById = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    res.json(appointment);
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Update Appointment
const updateAppointment = async (req, res) => {
  console.log("Executing updateAppointment");
  const { id } = req.params;
  const { status } = req.body;

  try {
    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appointment.status = status;
    await appointment.save();

    res.json({
      message: "Appointment updated successfully",
      status: appointment.status,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Delete Appointment
const deleteAppointment = async (req, res) => {
  console.log("Executing deleteAppointment");

  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Id is required" });
    }

    const appointment = await Appointment.findByPk(id);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    await appointment.destroy();
    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

module.exports = {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
};
