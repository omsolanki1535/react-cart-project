const express = require("express")
const Course = require("../models/Course")
const Enrollment = require("../models/Enrollment")
const Student = require("../models/Student")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const filter = req.query.studentId ? { student: req.query.studentId } : {}
    const enrollments = await Enrollment.find(filter)
      .populate("student", "fullName email studentId department semester")
      .populate("course")
      .sort({ createdAt: -1 })

    res.json(enrollments)
  } catch (error) {
    res.status(500).json({ message: "Unable to load enrollments." })
  }
})

router.post("/", async (req, res) => {
  try {
    const { studentId, courseId } = req.body

    if (!studentId || !courseId) {
      return res.status(400).json({ message: "Student and course are required." })
    }

    const [student, course, existingEnrollment] = await Promise.all([
      Student.findById(studentId),
      Course.findById(courseId),
      Enrollment.findOne({ student: studentId, course: courseId })
    ])

    if (!student) {
      return res.status(404).json({ message: "Student not found." })
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found." })
    }

    if (existingEnrollment) {
      return res.status(409).json({ message: "Student is already enrolled in this course." })
    }

    if (course.enrolledCount >= course.capacity) {
      return res.status(400).json({ message: "This course has reached full capacity." })
    }

    const enrollment = await Enrollment.create({
      student: studentId,
      course: courseId
    })

    course.enrolledCount += 1
    await course.save()

    const populatedEnrollment = await Enrollment.findById(enrollment._id)
      .populate("student", "fullName email studentId department semester")
      .populate("course")

    res.status(201).json({
      message: "Enrollment successful.",
      enrollment: populatedEnrollment
    })
  } catch (error) {
    res.status(500).json({ message: "Unable to create enrollment." })
  }
})

router.delete("/:id", async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id)

    if (!enrollment) {
      return res.status(404).json({ message: "Enrollment not found." })
    }

    const course = await Course.findById(enrollment.course)
    if (course) {
      course.enrolledCount = Math.max(course.enrolledCount - 1, 0)
      await course.save()
    }

    res.json({ message: "Enrollment removed successfully." })
  } catch (error) {
    res.status(500).json({ message: "Unable to remove enrollment." })
  }
})

module.exports = router
