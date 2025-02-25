const request = require("supertest");
const app = require("../../index");
const User = require("../../models/User");
const Appointment = require("../../models/Appointment");
const db = require("../../database/db");
const bcrypt = require("bcrypt");

describe("Appointment Flow", () => {
  let userToken;
  let adminToken;
  let testAppointmentId;

  beforeAll(async () => {
    try {
      await db.sync({ force: true }); // Reset database

      // Create test user
      const userResponse = await request(app).post("/api/users/register").send({
        fullname: "Test User",
        email: "testuser@example.com",
        phone_number: "1234567890",
        username: "testuser",
        password: "password123",
        role: "user",
      });

      expect(userResponse.status).toBe(201);
      userToken = userResponse.body.token;

      // Create admin user
      const adminResponse = await request(app)
        .post("/api/users/register")
        .send({
          fullname: "Admin User",
          email: "admin@example.com",
          phone_number: "0987654321",
          username: "adminuser",
          password: "admin123",
          role: "admin",
        });

      expect(adminResponse.status).toBe(201);
      adminToken = adminResponse.body.token;

      if (!userToken || !adminToken) {
        throw new Error("Failed to get authentication tokens");
      }
    } catch (error) {
      console.error("Test setup failed:", error);
      throw error;
    }
  });

  afterAll(async () => {
    await db.close();
  });

  it("should create a new appointment", async () => {
    const appointmentData = {
      name: "Test User",
      email: "testuser@example.com",
      phoneNumber: "1234567890",
      date: new Date().toISOString(),
      category: "Hair Cutting",
    };

    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${userToken}`)
      .send(appointmentData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("success", true);
    expect(response.body.data).toHaveProperty("id");
    testAppointmentId = response.body.data.id;
  });

  it("should fail to create appointment without token", async () => {
    const appointmentData = {
      name: "Test User",
      email: "testuser@example.com",
      phoneNumber: "1234567890",
      date: new Date().toISOString(),
      category: "Hair Cutting",
    };

    const response = await request(app)
      .post("/api/appointments")
      .send(appointmentData);

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty("error", "Authentication required");
  });

  it("should get all appointments as admin", async () => {
    const response = await request(app)
      .get("/api/appointments")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should get specific appointment by id", async () => {
    const response = await request(app)
      .get(`/api/appointments/${testAppointmentId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", testAppointmentId);
  });

  it("should update appointment status", async () => {
    const response = await request(app)
      .put(`/api/appointments/${testAppointmentId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send({ status: "confirmed" });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Appointment updated successfully"
    );
    expect(response.body).toHaveProperty("status", "confirmed");
  });

  it("should handle appointment date conflicts", async () => {
    const existingDate = new Date();
    const appointmentData = {
      name: "Another User",
      email: "another@example.com",
      phoneNumber: "5555555555",
      date: existingDate.toISOString(),
      category: "Hair Cutting",
    };

    // Create first appointment
    await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${userToken}`)
      .send(appointmentData);

    // Try to create another appointment at the same time
    const response = await request(app)
      .post("/api/appointments")
      .set("Authorization", `Bearer ${userToken}`)
      .send(appointmentData);

    expect(response.status).toBe(409);
    expect(response.body).toHaveProperty(
      "error",
      "Time slot is already booked"
    );
  });

  it("should delete an appointment", async () => {
    const response = await request(app)
      .delete(`/api/appointments/${testAppointmentId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Appointment deleted successfully"
    );

    // Verify deletion
    const getResponse = await request(app)
      .get(`/api/appointments/${testAppointmentId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(getResponse.status).toBe(404);
  });

  it("should handle multiple appointments for same user", async () => {
    const appointments = Array(3)
      .fill()
      .map((_, i) => ({
        name: "Test User",
        email: "testuser@example.com",
        phoneNumber: "1234567890",
        date: new Date(
          Date.now() + (i + 1) * 24 * 60 * 60 * 1000
        ).toISOString(),
        category: "Hair Cutting",
      }));

    const responses = await Promise.all(
      appointments.map((appointment) =>
        request(app)
          .post("/api/appointments")
          .set("Authorization", `Bearer ${userToken}`)
          .send(appointment)
      )
    );

    responses.forEach((response) => {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("success", true);
    });
  });
});
