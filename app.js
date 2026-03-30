const path = require("path")
const express = require("express")
const mongoose = require("mongoose")
require("dotenv").config()

const studentsRoute = require("./routes/students")
const coursesRoute = require("./routes/courses")
const enrollmentsRoute = require("./routes/enrollments")

const app = express()
const PORT = process.env.PORT || 5000
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/studentCourseRegistration"

app.use(express.json())

app.get("/api/health", (req, res) => {
  res.json({ message: "Student Course Registration API is running." })
})

app.use("/api/students", studentsRoute)
app.use("/api/courses", coursesRoute)
app.use("/api/enrollments", enrollmentsRoute)

const distPath = path.join(__dirname, "dist")
app.use(express.static(distPath))

app.get(/^(?!\/api\/).*/, (req, res, next) => {
  res.sendFile(path.join(distPath, "index.html"), (error) => {
    if (error) {
      next()
    }
  })
})

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected")
    app.listen(PORT, () => {
      console.log(`Server started on port ${PORT}`)
    })
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error.message)
  })
