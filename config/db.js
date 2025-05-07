const { Sequelize } = require("sequelize");
const dotenv = require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: "mysql",
    logging: console.log, // Enable to see SQL queries
    dialectOptions: {
      // XAMPP-specific options
      socketPath: "", // Only if using socket connection
      supportBigNumbers: true,
      bigNumberStrings: true,
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

sequelize
  .sync({ alter: true }) // or { force: true } to drop & recreate
  .then(() => {
    console.log("✅ Database synced successfully");
  })
  .catch((err) => {
    console.error("❌ Sequelize sync failed:", err);
  });

// Test connection function
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ XAMPP MySQL Connection Established");
    return sequelize;
  } catch (error) {
    console.error("❌ XAMPP Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = { sequelize, connectDB };
