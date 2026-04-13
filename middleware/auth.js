const jwt = require("jsonwebtoken")
const Student = require("../models/Student")

const JWT_SECRET = process.env.JWT_SECRET || "development-jwt-secret-change-me"

function getTokenFromRequest(req) {
  const authorization = String(req.headers.authorization || "")

  if (!authorization.startsWith("Bearer ")) {
    return ""
  }

  return authorization.slice(7).trim()
}

async function requireAuth(req, res, next) {
  try {
    const token = getTokenFromRequest(req)

    if (!token) {
      return res.status(401).json({ message: "Authentication token is required." })
    }

    const payload = jwt.verify(token, JWT_SECRET)
    const student = await Student.findById(payload.studentId)

    if (!student) {
      return res.status(401).json({ message: "Authentication token is no longer valid." })
    }

    req.auth = {
      studentId: student._id.toString(),
      student
    }

    next()
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authentication token." })
  }
}

function signStudentToken(student) {
  return jwt.sign(
    {
      studentId: student._id.toString(),
      email: student.email
    },
    JWT_SECRET,
    {
      expiresIn: "7d"
    }
  )
}

module.exports = {
  requireAuth,
  signStudentToken
}
