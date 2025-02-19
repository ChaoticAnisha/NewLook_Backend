const { DataTypes } = require("sequelize");
const db = require("../database/db");

const User = db.define(
  "User",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    fullname: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    phone_number: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.STRING,
     enum:[],
      allowNull: false,
      defaultValue: "user", // Default role is 'user'
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  }
);

// Sync the model with the database
User.sync({ alter: true })
  .then(() => console.log("User table is ready."))
  .catch((error) => console.error("Error creating User table:", error));

module.exports = User;
