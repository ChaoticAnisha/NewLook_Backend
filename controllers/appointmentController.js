const Appointment = require("../models/Appointment");

// Create Appointment
const createAppointment = async (req, res) => {
  console.log("Executing createAppointment");
  const { name, email, phoneNumber, date, category } = req.body;
  const userId = req.user.id;
  console.log(userId);

  try {
    const newAppointment = await Appointment.create({
      userId,
      name,
      email,
      phoneNumber,
      date,
      category,
    });
    console.log(newAppointment);

    // res.status(201).json({ test: "done" });
    res.status(201).json({ success: true, data: newAppointment });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Get All Appointments
const getAllAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.findAll();
    res.json(appointments);
  } catch (error) {
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
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Update Appointment
const updateAppointment = async (req, res) => {
  const { id } = req.params;
  const { date, time, description } = req.body;

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    appointment.date = date;
    appointment.time = time;
    appointment.description = description;

    await appointment.save();

    res.json({ message: "Appointment updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Delete Appointment
const deleteAppointment = async (req, res) => {
  const { id } = req.params;

  try {
    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    await appointment.destroy();

    res.json({ message: "Appointment deleted successfully" });
  } catch (error) {
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
