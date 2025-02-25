const request = require("supertest");
const app = require("../../index");
const User = require("../../models/User");
const Service = require("../../models/Service");
const db = require("../../database/db");

describe("Service Management Flow", () => {
  let userToken;
  let adminToken;
  let testServiceId;

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

  it("should create a new service as admin", async () => {
    const serviceData = {
      icon: "scissors",
      title: "Hair Cutting",
      description: "Professional hair cutting service",
      category: "Hair Care",
    };

    const response = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(serviceData);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.title).toBe(serviceData.title);
    testServiceId = response.body.id;
  });

  it("should not create service as regular user", async () => {
    const serviceData = {
      icon: "spa",
      title: "Spa Treatment",
      description: "Relaxing spa treatment",
      category: "Spa",
    };

    const response = await request(app)
      .post("/api/services")
      .set("Authorization", `Bearer ${userToken}`)
      .send(serviceData);

    expect(response.status).toBe(403);
  });

  it("should get all services", async () => {
    const response = await request(app)
      .get("/api/services")
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
  });

  it("should get service by id", async () => {
    const response = await request(app)
      .get(`/api/services/${testServiceId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("id", testServiceId);
  });

  it("should update service as admin", async () => {
    const updateData = {
      title: "Updated Hair Cutting",
      description: "Updated description",
    };

    const response = await request(app)
      .put(`/api/services/${testServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Service updated successfully"
    );

    // Verify update
    const getResponse = await request(app)
      .get(`/api/services/${testServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getResponse.body.title).toBe(updateData.title);
    expect(getResponse.body.description).toBe(updateData.description);
  });

  it("should not update service as regular user", async () => {
    const updateData = {
      title: "Unauthorized Update",
      description: "This should fail",
    };

    const response = await request(app)
      .put(`/api/services/${testServiceId}`)
      .set("Authorization", `Bearer ${userToken}`)
      .send(updateData);

    expect(response.status).toBe(403);
  });

  it("should delete service as admin", async () => {
    const response = await request(app)
      .delete(`/api/services/${testServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      "message",
      "Service deleted successfully"
    );

    // Verify deletion
    const getResponse = await request(app)
      .get(`/api/services/${testServiceId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getResponse.status).toBe(404);
  });

  it("should handle bulk service creation", async () => {
    const services = [
      {
        icon: "cut",
        title: "Basic Cut",
        description: "Simple hair cut",
        category: "Hair Care",
      },
      {
        icon: "spa",
        title: "Basic Spa",
        description: "Relaxing spa treatment",
        category: "Spa",
      },
      {
        icon: "color",
        title: "Hair Color",
        description: "Professional hair coloring",
        category: "Hair Care",
      },
    ];

    const responses = await Promise.all(
      services.map((service) =>
        request(app)
          .post("/api/services")
          .set("Authorization", `Bearer ${adminToken}`)
          .send(service)
      )
    );

    responses.forEach((response) => {
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty("id");
    });

    // Verify all services were created
    const getAllResponse = await request(app)
      .get("/api/services")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(getAllResponse.status).toBe(200);
    expect(getAllResponse.body.length).toBeGreaterThanOrEqual(services.length);
  });
});
