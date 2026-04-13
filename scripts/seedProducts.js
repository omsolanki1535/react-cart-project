const mongoose = require("mongoose")
require("dotenv").config()

const Course = require("../models/Course")
const Product = require("../models/Product")

const createProductImage = (label, colors) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 480">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${colors[0]}" />
          <stop offset="100%" stop-color="${colors[1]}" />
        </linearGradient>
      </defs>
      <rect width="640" height="480" rx="32" fill="url(#g)" />
      <circle cx="520" cy="110" r="78" fill="rgba(255,255,255,0.2)" />
      <circle cx="120" cy="370" r="120" fill="rgba(255,255,255,0.12)" />
      <rect x="80" y="120" width="480" height="220" rx="28" fill="rgba(255,255,255,0.18)" />
      <text x="320" y="260" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700" fill="#ffffff">
        ${label}
      </text>
    </svg>
  `)}`

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

const sampleProducts = [
  {
    name: "Mechanical Keyboard",
    description: "Compact hot-swappable keyboard with tactile switches and white backlight.",
    price: 6499,
    stock: 14,
    category: "Computers & Accessories",
    image: createProductImage("Mechanical Keyboard", ["#0f172a", "#f59e0b"])
  },
  {
    name: "Wireless Mouse",
    description: "Ergonomic precision mouse with silent clicks and USB-C charging.",
    price: 2499,
    stock: 20,
    category: "Computers & Accessories",
    image: createProductImage("Wireless Mouse", ["#1d4ed8", "#38bdf8"])
  },
  {
    name: "Studio Headphones",
    description: "Over-ear headphones with balanced sound, soft cushions, and foldable design.",
    price: 8999,
    stock: 8,
    category: "Audio",
    image: createProductImage("Studio Headphones", ["#7c3aed", "#ec4899"])
  },
  {
    name: "27-inch Monitor",
    description: "QHD display with slim bezels, 100Hz refresh rate, and HDMI connectivity.",
    price: 22999,
    stock: 6,
    category: "Displays",
    image: createProductImage("27-inch Monitor", ["#059669", "#34d399"])
  },
  {
    name: "Portable Speaker",
    description: "Room-filling wireless speaker with deep bass and all-day battery life.",
    price: 4299,
    stock: 11,
    category: "Audio",
    image: createProductImage("Portable Speaker", ["#ea580c", "#facc15"])
  },
  {
    name: "HD Webcam",
    description: "1080p webcam with low-light correction and dual noise-reduction microphones.",
    price: 3199,
    stock: 17,
    category: "Work From Home",
    image: createProductImage("HD Webcam", ["#111827", "#6b7280"])
  }
]

async function seedData() {
  const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/studentCourseRegistration"

  try {
    await mongoose.connect(mongoUri)

    const courseOperations = sampleCourses.map((course) => ({
      updateOne: {
        filter: { courseCode: course.courseCode },
        update: { $set: course },
        upsert: true
      }
    }))

    const productOperations = sampleProducts.map((product) => ({
      updateOne: {
        filter: { name: product.name },
        update: { $set: product },
        upsert: true
      }
    }))

    const courseResult = await Course.bulkWrite(courseOperations)
    const productResult = await Product.bulkWrite(productOperations)
    const totalCourses = await Course.countDocuments()
    const totalProducts = await Product.countDocuments()

    console.log("Seed completed.")
    console.log(`Courses inserted: ${courseResult.upsertedCount}`)
    console.log(`Courses updated: ${courseResult.modifiedCount}`)
    console.log(`Products inserted: ${productResult.upsertedCount}`)
    console.log(`Products updated: ${productResult.modifiedCount}`)
    console.log(`Total courses in database: ${totalCourses}`)
    console.log(`Total products in database: ${totalProducts}`)
  } catch (error) {
    console.error("Seeding failed:", error.message)
    process.exitCode = 1
  } finally {
    await mongoose.connection.close()
  }
}

seedData()
