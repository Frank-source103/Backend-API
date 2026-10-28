const express = require("express");

const cors = require("cors");
const studentRoutes = require("./routes/student.routes");
const courseRoutes = require("./routes/course.routes");
const resultRoutes = require("./routes/result.routes");
const notFound = require("./middleware/notFound");
const errorHandler = require("./middleware/errorHandler");

const app = express();

// Lets Express read JSON sent in request bodies
app.use(cors());
app.use(express.json());

// Quick check that the server is alive
app.get("/api/v1/health", (req, res) => {
  res.json({ success: true, message: "SRM API is running" });
});

app.use("/api/v1/students", studentRoutes);
app.use("/api/v1/courses", courseRoutes);
app.use("/api/v1/results", resultRoutes);

// These two MUST stay last, in this order
app.use(notFound);
app.use(errorHandler);

module.exports = app;
