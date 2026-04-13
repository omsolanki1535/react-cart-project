const crypto = require("crypto")
const express = require("express")
const Course = require("../models/Course")
const Student = require("../models/Student")
const Enrollment = require("../models/Enrollment")
const { requireAuth, signStudentToken } = require("../middleware/auth")

const router = express.Router()

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function normalizeStudentPayload(body = {}) {
  return {
    fullName: String(body.fullName || "").trim(),
    email: String(body.email || "").trim().toLowerCase(),
    password: String(body.password || ""),
    studentId: String(body.studentId || "").trim().toUpperCase(),
    department: String(body.department || "").trim(),
    semester: Number(body.semester)
  }
}

function sanitizeStudent(student) {
  return {
    _id: student._id,
    fullName: student.fullName,
    email: student.email,
    studentId: student.studentId,
    department: student.department,
    semester: student.semester,
    createdAt: student.createdAt,
    updatedAt: student.updatedAt
  }
}

function validateStudentPayload(payload, options = {}) {
  const allowPartial = Boolean(options.allowPartial)
  const errors = []

  if ((!allowPartial || payload.fullName) && payload.fullName.length < 3) {
    errors.push("Full name must be at least 3 characters long.")
  }

  if ((!allowPartial || payload.email) && !EMAIL_PATTERN.test(payload.email)) {
    errors.push("Enter a valid email address.")
  }

  if (!allowPartial && payload.password.length < 6) {
    errors.push("Password must be at least 6 characters long.")
  }

  if ((!allowPartial || payload.studentId) && payload.studentId.length < 4) {
    errors.push("Student ID must be at least 4 characters long.")
  }

  if ((!allowPartial || payload.department) && payload.department.length < 2) {
    errors.push("Department must be at least 2 characters long.")
  }

  if ((!allowPartial || Number.isFinite(payload.semester)) && (!Number.isInteger(payload.semester) || payload.semester < 1 || payload.semester > 8)) {
    errors.push("Semester must be a whole number between 1 and 8.")
  }

  return errors
}

async function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error)
        return
      }
      resolve(key.toString("hex"))
    })
  })

  return `${salt}:${derivedKey}`
}

async function verifyPassword(password, storedHash) {
  if (!storedHash) {
    return false
  }

  if (!storedHash.includes(":")) {
    const legacyHash = crypto.createHash("sha256").update(password).digest("hex")
    return storedHash === legacyHash
  }

  const [salt, originalKey] = storedHash.split(":")
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, 64, (error, key) => {
      if (error) {
        reject(error)
        return
      }
      resolve(key.toString("hex"))
    })
  })

  return crypto.timingSafeEqual(Buffer.from(originalKey, "hex"), Buffer.from(derivedKey, "hex"))
}

router.get("/", requireAuth, async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 })
    res.json(students.map(sanitizeStudent))
  } catch (error) {
    res.status(500).json({ message: "Unable to load students." })
  }
})

router.get("/me", requireAuth, async (req, res) => {
  res.json({
    student: sanitizeStudent(req.auth.student)
  })
})

router.post("/register", async (req, res) => {
  try {
    const payload = normalizeStudentPayload(req.body)
    const validationErrors = validateStudentPayload(payload)

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors[0], errors: validationErrors })
    }

    const existingStudent = await Student.findOne({
      $or: [{ email: payload.email }, { studentId: payload.studentId }]
    })

    if (existingStudent) {
      return res.status(409).json({ message: "A student with that email or ID already exists." })
    }

    const student = await Student.create({
      fullName: payload.fullName,
      email: payload.email,
      passwordHash: await hashPassword(payload.password),
      studentId: payload.studentId,
      department: payload.department,
      semester: payload.semester
    })

    res.status(201).json({
      message: "Registration successful.",
      student: sanitizeStudent(student),
      token: signStudentToken(student)
    })
  } catch (error) {
    res.status(500).json({ message: "Unable to register student." })
  }
})

router.post("/login", async (req, res) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase()
    const password = String(req.body.password || "")

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." })
    }

    const student = await Student.findOne({ email })

    if (!student || !(await verifyPassword(password, student.passwordHash))) {
      return res.status(401).json({ message: "Invalid email or password." })
    }

    res.json({
      message: "Login successful.",
      student: sanitizeStudent(student),
      token: signStudentToken(student)
    })
  } catch (error) {
    res.status(500).json({ message: "Unable to log in right now." })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  try {
    if (req.auth.studentId !== req.params.id) {
      return res.status(403).json({ message: "You can only update your own student profile." })
    }

    const updates = {
      fullName: String(req.body.fullName || "").trim(),
      department: String(req.body.department || "").trim(),
      semester: Number(req.body.semester)
    }

    const validationErrors = validateStudentPayload(
      {
        fullName: updates.fullName,
        email: "placeholder@example.com",
        password: "placeholder123",
        studentId: "TEMP1",
        department: updates.department,
        semester: updates.semester
      },
      { allowPartial: true }
    )

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors[0], errors: validationErrors })
    }

    const student = await Student.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true
    })

    if (!student) {
      return res.status(404).json({ message: "Student not found." })
    }

    res.json({
      message: "Student updated successfully.",
      student: sanitizeStudent(student),
      token: signStudentToken(student)
    })
  } catch (error) {
    res.status(500).json({ message: "Unable to update student." })
  }
})

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    if (req.auth.studentId !== req.params.id) {
      return res.status(403).json({ message: "You can only delete your own student profile." })
    }

    const enrollments = await Enrollment.find({ student: req.params.id })
    const deletedStudent = await Student.findByIdAndDelete(req.params.id)

    if (!deletedStudent) {
      return res.status(404).json({ message: "Student not found." })
    }

    await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await Course.findById(enrollment.course)
        if (course) {
          course.enrolledCount = Math.max(course.enrolledCount - 1, 0)
          await course.save()
        }
      })
    )

    await Enrollment.deleteMany({ student: req.params.id })
    res.json({ message: "Student deleted successfully." })
  } catch (error) {
    res.status(500).json({ message: "Unable to delete student." })
  }
})

module.exports = router
