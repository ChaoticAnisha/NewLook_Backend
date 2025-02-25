const { DataTypes } = require("sequelize");
const User = require("../../models/User");
const db = require("../../database/db");

describe("User Model", () => {
  beforeAll(async () => {
    await db.sync({ force: true }); // Recreate tables
  });

  afterAll(async () => {
    await db.close();
  });

  it("should create a valid user", async () => {
    const validUser = {
      fullname: "Test User",
      email: "test@example.com",
      phone_number: "1234567890",
      username: "testuser",
      password: "password123",
      role: "user",
    };

    const user = await User.create(validUser);
    expect(user.id).toBeDefined();
    expect(user.email).toBe(validUser.email);
    expect(user.role).toBe("user"); // Default role
  });

  it("should not create user without required fields", async () => {
    const invalidUser = {
      fullname: "Test User",
      // Missing required fields
    };

    await expect(User.create(invalidUser)).rejects.toThrow();
  });

  it("should not create user with invalid email", async () => {
    const invalidUser = {
      fullname: "Test User",
      email: "invalid-email",
      phone_number: "1234567890",
      username: "testuser2",
      password: "password123",
    };

    await expect(User.create(invalidUser)).rejects.toThrow();
  });

  it("should not create user with duplicate email", async () => {
    const user1 = {
      fullname: "Test User 1",
      email: "duplicate@example.com",
      phone_number: "1234567890",
      username: "testuser3",
      password: "password123",
    };

    await User.create(user1);

    const user2 = {
      ...user1,
      username: "testuser4",
    };

    await expect(User.create(user2)).rejects.toThrow();
  });

  it("should not create user with duplicate username", async () => {
    const user1 = {
      fullname: "Test User 1",
      email: "test1@example.com",
      phone_number: "1234567890",
      username: "duplicateuser",
      password: "password123",
    };

    await User.create(user1);

    const user2 = {
      ...user1,
      email: "test2@example.com",
    };

    await expect(User.create(user2)).rejects.toThrow();
  });

  it("should have correct data types", () => {
    const userModel = User.rawAttributes;

    expect(userModel.fullname.type instanceof DataTypes.STRING).toBeTruthy();
    expect(userModel.email.type instanceof DataTypes.STRING).toBeTruthy();
    expect(
      userModel.phone_number.type instanceof DataTypes.STRING
    ).toBeTruthy();
    expect(userModel.username.type instanceof DataTypes.STRING).toBeTruthy();
    expect(userModel.password.type instanceof DataTypes.STRING).toBeTruthy();
    expect(userModel.role.type instanceof DataTypes.STRING).toBeTruthy();
  });
});
