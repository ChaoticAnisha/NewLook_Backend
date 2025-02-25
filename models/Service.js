const { DataTypes } = require("sequelize");
const db = require("../database/db");

const Service = db.define(
  "Service",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "General",
    },
  },
  {
    timestamps: true,
  }
);

// Sync the model with the database
Service.sync()
  .then(() => console.log("Service table is ready."))
  .catch((error) => console.error("Error creating Service table:", error));

module.exports = Service;
