const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerUi = require("swagger-ui-express");
const swaggerDocument = require("./docs/swagger.json");
const rateLimit = require("express-rate-limit");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const projectRoutes = require("./routes/projectRoutes");
const AppError = require("./utils/appError");
const globalErrorHandler = require("./utils/errorController");
const errorHandler = require("./middlewares/errorMiddleware");
const { default: helmet } = require("helmet");
const { connectDB, sequelize } = require("./config/db");
const dotenv = require("dotenv").config();
const app = express();

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
// });
// app.use(limiter);

// Prevent http param pollution
// app.use(hpp());

// Middlewares
const corsOptions = {
  origin: [
    "https://ngwater.app",
    "https://www.ngwater.app",
    "http://localhost:5174",
  ],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(morgan("dev"));
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();
// Static files (for uploaded files)
app.use("/uploads", express.static("uploads"));

// Connect to database

// Dev logging middleware
// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// Routes
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/projects", projectRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// Test routes
app.get("/", (req, res) => {
  res.send(`
    <h1>API Status: Running</h1>
    <h2>Endpoints:</h2>
    <ul>
      <li><a href="/xampp-test">Database Test</a></li>
      <li><a href="/test-user">User Test</a></li>
    </ul>
  `);
});

app.get("/xampp-test", async (req, res, next) => {
  try {
    const [results] = await sequelize.query("SELECT 1+1 AS result");
    res.json({
      status: "success",
      database: "connected",
      result: results[0].result,
    });
  } catch (error) {
    next(error);
  }
});

// Swagger Documentation
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use(globalErrorHandler);
app.use(errorHandler);

module.exports = app;
