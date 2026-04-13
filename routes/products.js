const express = require("express")
const Product = require("../models/Product")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

function normalizeProductPayload(body = {}) {
  return {
    name: String(body.name || "").trim(),
    description: String(body.description || "").trim(),
    price: Number(body.price),
    stock: Number(body.stock),
    image: String(body.image || "").trim(),
    category: String(body.category || "General").trim()
  }
}

function validateProductPayload(payload) {
  const errors = []

  if (payload.name.length < 3) {
    errors.push("Product name must be at least 3 characters long.")
  }

  if (payload.description.length < 10) {
    errors.push("Product description must be at least 10 characters long.")
  }

  if (!Number.isFinite(payload.price) || payload.price < 0) {
    errors.push("Price must be a valid non-negative number.")
  }

  if (!Number.isInteger(payload.stock) || payload.stock < 0) {
    errors.push("Stock must be a whole number that is 0 or greater.")
  }

  return errors
}

router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 })
    res.json(products)
  } catch (error) {
    res.status(500).json({ message: "Unable to load products." })
  }
})

router.post("/", requireAuth, async (req, res) => {
  try {
    const payload = normalizeProductPayload(req.body)
    const validationErrors = validateProductPayload(payload)

    if (validationErrors.length > 0) {
      return res.status(400).json({ message: validationErrors[0], errors: validationErrors })
    }

    const product = await Product.create(payload)
    res.status(201).json({ message: "Product created successfully.", product })
  } catch (error) {
    res.status(500).json({ message: "Unable to create product." })
  }
})

module.exports = router
