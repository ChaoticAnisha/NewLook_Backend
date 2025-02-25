const { DataTypes } = require("sequelize");
const db = require("../database/db");

const Appointment = db.define(
  "Appointment",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "id",
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phoneNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("pending", "confirmed", "completed", "cancelled"),
      defaultValue: "pending",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Sync the model with the database
Appointment.sync()
  .then(() => console.log("Appointment table is ready."))
  .catch((error) => console.error("Error creating Appointment table:", error));

module.exports = Appointment;
