const app = require("./app");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`
  Server running on http://localhost:${PORT}
  XAMPP MySQL: ${process.env.DB_HOST}:${process.env.DB_PORT}
  `);
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});
