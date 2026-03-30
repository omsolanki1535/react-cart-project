const express = require("express")
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")

const router = express.Router()

function normalizeCoursePayload(body = {}) {
  return {
    courseCode: String(body.courseCode || "").trim().toUpperCase(),
    title: String(body.title || "").trim(),
    instructor: String(body.instructor || "").trim(),
    department: String(body.department || "").trim(),
    credits: Number(body.credits),
    capacity: Number(body.capacity),
    schedule: String(body.schedule || "").trim(),
    description: String(body.description || "").trim()
  }
}

function validateCoursePayload(payload) {
  const errors = []

  if (payload.courseCode.length < 4) {
    errors.push("Course code must be at least 4 characters long.")
  }

  if (payload.title.length < 4) {
    errors.push("Course title must be at least 4 characters long.")
  }

  if (payload.instructor.length < 3) {
    errors.push("Instructor name must be at least 3 characters long.")
  }

  if (payload.department.length < 2) {
    errors.push("Department must be at least 2 characters long.")
  }

  if (!Number.isInteger(payload.credits) || payload.credits < 1 || payload.credits > 6) {
    errors.push("Credits must be a whole number between 1 and 6.")
  }

  if (!Number.isInteger(payload.capacity) || payload.capacity < 1) {
    errors.push("Capacity must be a whole number greater than 0.")
  }

  if (payload.schedule.length < 5) {
    errors.push("Schedule must be at least 5 characters long.")
  }

  return errors
}

router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().sort({ courseCode: 1 })
    res.json(courses)
  } catch (error) {
    res.status(500).json({ message: "Unable to load courses." })
  }
})

router.post("/", async (req, res) => {
  try {
    const payload = normalizeCoursePayload(req.body)
    const validationErrors = validateCoursePayload(payload)

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors[0], errors: validationErrors })
    }

    const course = await Course.create(payload)
    res.status(201).json({ message: "Course created successfully.", course })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Course code already exists." })
    }

    res.status(500).json({ message: "Unable to create course." })
  }
})

router.put("/:id", async (req, res) => {
  try {
    const payload = normalizeCoursePayload(req.body)
    const validationErrors = validateCoursePayload(payload)

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors[0], errors: validationErrors })
    }

    const existingCourse = await Course.findById(req.params.id)

    if (!existingCourse) {
      return res.status(404).json({ message: "Course not found." })
    }

    if (payload.capacity < existingCourse.enrolledCount) {
      return res.status(400).json({
        message: `Capacity cannot be lower than the current enrollment count of ${existingCourse.enrolledCount}.`
      })
    }

    const course = await Course.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    })

    res.json({ message: "Course updated successfully.", course })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Course code already exists." })
    }

    res.status(500).json({ message: "Unable to update course." })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)

    if (!course) {
      return res.status(404).json({ message: "Course not found." })
    }

    const activeEnrollmentCount = await Enrollment.countDocuments({ course: req.params.id })

    if (activeEnrollmentCount > 0) {
      return res.status(400).json({
        message: "This course still has enrolled students. Remove enrollments before deleting it."
      })
    }

    await Course.findByIdAndDelete(req.params.id)
    res.json({ message: "Course deleted successfully." })
  } catch (error) {
    res.status(500).json({ message: "Unable to delete course." })
  }
})

module.exports = router
