const fs = require("fs")
const path = require("path")
const express = require("express")
const multer = require("multer")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()
const uploadsDirectory = path.join(__dirname, "..", "uploads")

fs.mkdirSync(uploadsDirectory, { recursive: true })

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDirectory)
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase()
    const baseName = path
      .basename(file.originalname || "image", extension)
      .trim()
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()

    callback(null, `${Date.now()}-${baseName || "image"}${extension || ".png"}`)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("Only image uploads are allowed."))
      return
    }

    callback(null, true)
  }
})

router.post("/", requireAuth, (req, res) => {
  upload.single("image")(req, res, (error) => {
    if (error) {
      return res.status(400).json({ message: error.message || "Upload failed." })
    }

    if (!req.file) {
      return res.status(400).json({ message: "Select an image file to upload." })
    }

    res.status(201).json({
      message: "Image uploaded successfully.",
      imageUrl: `/uploads/${req.file.filename}`,
      fileName: req.file.filename
    })
  })
})

module.exports = router
