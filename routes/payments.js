const express = require("express")
const { requireAuth } = require("../middleware/auth")

const router = express.Router()

router.post("/checkout", requireAuth, async (req, res) => {
  try {
    const items = Array.isArray(req.body.items) ? req.body.items : []
    const paymentMethod = String(req.body.paymentMethod || "card").trim().toLowerCase()
    const cardholderName = String(req.body.cardholderName || "").trim()
    const cardNumber = String(req.body.cardNumber || "").replace(/\s+/g, "")
    const totalAmount = Number(req.body.totalAmount)

    if (!items.length) {
      return res.status(400).json({ message: "Add at least one product before checkout." })
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      return res.status(400).json({ message: "Total amount must be greater than 0." })
    }

    if (paymentMethod !== "card") {
      return res.status(400).json({ message: "Only mock card payments are supported in this demo." })
    }

    if (cardholderName.length < 3) {
      return res.status(400).json({ message: "Cardholder name must be at least 3 characters long." })
    }

    if (!/^\d{16}$/.test(cardNumber)) {
      return res.status(400).json({ message: "Enter a valid 16-digit test card number." })
    }

    const declinedCards = new Set(["4000000000000002", "4111111111111110"])
    const approved = !declinedCards.has(cardNumber)

    if (!approved) {
      return res.status(402).json({
        message: "Mock payment declined. Try another test card number.",
        status: "failed"
      })
    }

    return res.json({
      message: "Mock payment successful.",
      status: "paid",
      transactionId: `TXN-${Date.now()}`,
      amountCharged: totalAmount,
      paidBy: req.auth.student.email
    })
  } catch (error) {
    return res.status(500).json({ message: "Unable to process mock payment right now." })
  }
})

module.exports = router
