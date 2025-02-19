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
    },
  },
  {
    timestamps: true,
  }
);

Service.sync({ force: true }) 
  .then(() => console.log("Service table has been recreated."))
  .catch((error) => console.error("Error recreating Service table:", error));

module.exports = Service;
