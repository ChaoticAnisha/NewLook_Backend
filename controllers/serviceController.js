const Service = require("../models/Service");

// Create Service
const createService = async (req, res) => {
  const { icon, title, description, category } = req.body;

  try {
    const newService = await Service.create({
      icon,
      title,
      description,
      category,
    });

    res.status(201).json(newService);
  } catch (error) {
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Get All Services
const getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Get Service by ID
const getServiceById = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Update Service
const updateService = async (req, res) => {
  const { id } = req.params;
  const { icon, title, description, category } = req.body;

  try {
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    // Only update fields that are provided
    if (icon !== undefined) service.icon = icon;
    if (title !== undefined) service.title = title;
    if (description !== undefined) service.description = description;
    if (category !== undefined) service.category = category;

    await service.save();

    res.json({ message: "Service updated successfully" });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({ error: "Server error occurred" });
  }
};

// Delete Service
const deleteService = async (req, res) => {
  const { id } = req.params;

  try {
    const service = await Service.findByPk(id);

    if (!service) {
      return res.status(404).json({ error: "Service not found" });
    }

    await service.destroy();

    res.json({ message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error occurred" });
  }
};

module.exports = {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
};
