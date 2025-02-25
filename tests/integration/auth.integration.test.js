const request = require("supertest");
const app = require("../../index");
const User = require("../../models/User");
const db = require("../../database/db");

describe("Authentication Flow", () => {
  beforeAll(async () => {
    await db.sync({ force: true }); // Reset database
  });

  afterAll(async () => {
    await db.close();
  });

  const testUser = {
    fullname: "Integration Test User",
    email: "integration@test.com",
    phone_number: "1234567890",
    username: "integrationuser",
    password: "testpassword123",
  };

  let authToken;

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/api/users/register")
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body.message).toBe("Registration Successful");
  });

  it("should login with registered user", async () => {
    const response = await request(app).post("/api/users/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("role");
    authToken = response.body.token;
  });

  it("should access protected route with valid token", async () => {
    const response = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("email", testUser.email);
  });

  it("should update user profile", async () => {
    const updateData = {
      fullname: "Updated Test User",
      phone_number: "9876543210",
    };

    const response = await request(app)
      .put("/api/users/update-profile")
      .set("Authorization", `Bearer ${authToken}`)
      .send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Profile updated successfully");

    // Verify the update
    const userResponse = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${authToken}`);

    expect(userResponse.body.fullname).toBe(updateData.fullname);
    expect(userResponse.body.phone_number).toBe(updateData.phone_number);
  });

  it("should reset password", async () => {
    const newPassword = "newpassword123";
    const resetResponse = await request(app)
      .post("/api/users/reset-password")
      .send({
        username: testUser.username,
        newPassword,
      });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.message).toBe("Password reset successful");

    // Try logging in with new password
    const loginResponse = await request(app).post("/api/users/login").send({
      email: testUser.email,
      password: newPassword,
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body).toHaveProperty("token");
  });

  it("should handle concurrent requests properly", async () => {
    const promises = Array(5)
      .fill()
      .map(() =>
        request(app)
          .get("/api/users")
          .set("Authorization", `Bearer ${authToken}`)
      );

    const responses = await Promise.all(promises);
    responses.forEach((response) => {
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("email", testUser.email);
    });
  });
});
