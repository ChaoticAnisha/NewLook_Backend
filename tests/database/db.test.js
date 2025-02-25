const sequelize = require("../../database/db");

describe("Database Connection", () => {
  beforeAll(async () => {
    // Ensure database is connected before tests
    try {
      await sequelize.authenticate();
    } catch (error) {
      console.error("Unable to connect to the database:", error);
    }
  });

  afterAll(async () => {
    // Close database connection after tests
    await sequelize.close();
  });

  it("should connect to the database successfully", async () => {
    try {
      await sequelize.authenticate();
      expect(true).toBe(true); // If we reach here, connection was successful
    } catch (error) {
      fail("Database connection failed");
    }
  });

  it("should have proper environment variables set", () => {
    expect(process.env.DB_NAME).toBeDefined();
    expect(process.env.DB_USER).toBeDefined();
    expect(process.env.DB_PASS).toBeDefined();
    expect(process.env.DB_HOST).toBeDefined();
  });

  it("should have proper dialect set", () => {
    expect(sequelize.getDialect()).toBe("postgres");
  });

  it("should have proper database name set", () => {
    expect(sequelize.config.database).toBe(process.env.DB_NAME);
  });
});
