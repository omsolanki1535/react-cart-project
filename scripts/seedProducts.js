const mongoose = require("mongoose")
require("dotenv").config()

const Course = require("../models/Course")

const sampleCourses = [
  {
    courseCode: "CSE101",
    title: "Introduction to Programming",
    instructor: "Dr. Kavita Rao",
    department: "Computer Science",
    credits: 4,
    capacity: 60,
    schedule: "Mon-Wed 10:00 AM - 11:30 AM",
    description: "Covers programming fundamentals, flow control, and problem solving."
  },
  {
    courseCode: "CSE204",
    title: "Data Structures",
    instructor: "Prof. Amit Verma",
    department: "Computer Science",
    credits: 3,
    capacity: 50,
    schedule: "Tue-Thu 1:00 PM - 2:30 PM",
    description: "Introduces arrays, linked lists, stacks, queues, trees, and graphs."
  },
  {
    courseCode: "MAT201",
    title: "Discrete Mathematics",
    instructor: "Dr. Neha Sharma",
    department: "Mathematics",
    credits: 3,
    capacity: 55,
    schedule: "Mon-Fri 9:00 AM - 10:00 AM",
    description: "Focuses on logic, sets, relations, combinatorics, and graphs."
  },
  {
    courseCode: "ECE220",
    title: "Digital Electronics",
    instructor: "Prof. Suresh Iyer",
    department: "Electronics",
    credits: 4,
    capacity: 45,
    schedule: "Wed-Fri 2:00 PM - 3:30 PM",
    description: "Introduces number systems, logic gates, and combinational circuits."
  },
  {
    courseCode: "ENG110",
    title: "Technical Communication",
    instructor: "Ms. Ritu Malhotra",
    department: "Humanities",
    credits: 2,
    capacity: 70,
    schedule: "Saturday 10:00 AM - 12:00 PM",
    description: "Builds presentation, writing, and professional communication skills."
  }
]

async function seedCourses() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/studentCourseRegistration"

  try {
    await mongoose.connect(mongoUri)

    const operations = sampleCourses.map((course) => ({
      updateOne: {
        filter: { courseCode: course.courseCode },
        update: { $set: course },
        upsert: true
      }
    }))

    const result = await Course.bulkWrite(operations)
    const totalCourses = await Course.countDocuments()

    console.log("Course seed completed.")
    console.log(`Inserted: ${result.upsertedCount}`)
    console.log(`Updated: ${result.modifiedCount}`)
    console.log(`Total courses in database: ${totalCourses}`)
  } catch (error) {
    console.error("Seeding failed:", error.message)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

seedCourses()
