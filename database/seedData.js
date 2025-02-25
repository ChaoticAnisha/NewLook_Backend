const bcrypt = require("bcrypt");
const User = require("../models/User");
const db = require("./db");

async function seedDatabase() {
  try {
    // Sync database without force to preserve existing data
    await db.sync();

    // Check if admin already exists
    const existingAdmin = await User.findOne({
      where: { email: "admin@example.com" },
    });

    if (!existingAdmin) {
      // Create admin user
      const adminPassword = await bcrypt.hash("admin123", 10);
      await User.create({
        fullname: "Admin User",
        email: "admin@example.com",
        phone_number: "1234567890",
        username: "admin",
        password: adminPassword,
        role: "admin",
      });
      console.log("Admin user created successfully!");
    } else {
      console.log("Admin user already exists!");
    }

    // Check if test user already exists
    const existingUser = await User.findOne({
      where: { email: "user@example.com" },
    });

    if (!existingUser) {
      // Create a test user
      const userPassword = await bcrypt.hash("user123", 10);
      await User.create({
        fullname: "Test User",
        email: "user@example.com",
        phone_number: "0987654321",
        username: "user",
        password: userPassword,
        role: "user",
      });
      console.log("Test user created successfully!");
    } else {
      console.log("Test user already exists!");
    }

    console.log("Database seeding completed!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    // Close the database connection
    await db.close();
  }
}

// Run the seed function if this file is run directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
