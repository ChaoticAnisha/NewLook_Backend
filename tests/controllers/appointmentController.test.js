const request = require("supertest");
const app = require("../../index");
const Appointment = require("../../models/Appointment");
const jwt = require("jsonwebtoken");

// Mock Appointment model
jest.mock("../../models/Appointment");

describe("Appointment Controller Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockToken = jwt.sign(
    { id: 1, username: "testuser", role: "user" },
    process.env.JWT_SECRET
  );

  describe("createAppointment", () => {
    const mockAppointmentData = {
      name: "Test User",
      email: "test@example.com",
      phoneNumber: "1234567890",
      date: "2024-03-01T10:00:00.000Z",
      category: "Hair Cutting",
    };

    it("should successfully create an appointment", async () => {
      Appointment.create.mockResolvedValue({
        id: 1,
        userId: 1,
        ...mockAppointmentData,
      });

      const response = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(mockAppointmentData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
      expect(response.body.data).toHaveProperty("id");
    });

    it("should return error for invalid appointment data", async () => {
      const invalidData = {
        email: "test@example.com",
        phoneNumber: "1234567890",
        // Missing required fields: name, date
      };

      Appointment.create.mockRejectedValue(new Error("Validation error"));

      const response = await request(app)
        .post("/api/appointments")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("error");
    });
  });

  describe("getAllAppointments", () => {
    const mockAppointments = [
      {
        id: 1,
        userId: 1,
        name: "Test User 1",
        status: "pending",
      },
      {
        id: 2,
        userId: 2,
        name: "Test User 2",
        status: "confirmed",
      },
    ];

    it("should return all appointments for admin", async () => {
      Appointment.findAll.mockResolvedValue(mockAppointments);
      const adminToken = jwt.sign(
        { id: 1, role: "admin" },
        process.env.JWT_SECRET
      );

      const response = await request(app)
        .get("/api/appointments")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });
  });

  describe("getAppointmentById", () => {
    const mockAppointment = {
      id: 1,
      userId: 1,
      name: "Test User",
      status: "pending",
    };

    it("should return appointment by id", async () => {
      Appointment.findByPk.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .get("/api/appointments/1")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockAppointment);
    });

    it("should return 404 for non-existent appointment", async () => {
      Appointment.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .get("/api/appointments/999")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Appointment not found");
    });
  });

  describe("updateAppointment", () => {
    const mockAppointment = {
      id: 1,
      userId: 1,
      status: "pending",
      save: jest.fn(),
    };

    it("should successfully update appointment status", async () => {
      Appointment.findByPk.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .put("/api/appointments/1")
        .set("Authorization", `Bearer ${mockToken}`)
        .send({ status: "confirmed" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Appointment updated successfully"
      );
      expect(response.body).toHaveProperty("status", "confirmed");
    });
  });

  describe("deleteAppointment", () => {
    const mockAppointment = {
      id: 1,
      userId: 1,
      destroy: jest.fn(),
    };

    it("should successfully delete appointment", async () => {
      Appointment.findByPk.mockResolvedValue(mockAppointment);

      const response = await request(app)
        .delete("/api/appointments/1")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Appointment deleted successfully"
      );
    });

    it("should return 404 for non-existent appointment", async () => {
      Appointment.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .delete("/api/appointments/999")
        .set("Authorization", `Bearer ${mockToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("error", "Appointment not found");
    });
  });
});
