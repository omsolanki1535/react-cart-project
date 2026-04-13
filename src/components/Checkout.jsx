import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import { useShop } from "../context/ShopContext"

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, subtotal, clearCart, currentStudent } = useShop()
  const [paymentForm, setPaymentForm] = useState({
    cardholderName: "",
    cardNumber: ""
  })
  const [paymentState, setPaymentState] = useState({
    busy: false,
    message: "",
    type: ""
  })

  const handlePlaceOrder = async () => {
    if (!currentStudent) {
      setPaymentState({
        busy: false,
        type: "error",
        message: "Log in first to use the protected payment mock API."
      })
      return
    }

    setPaymentState({
      busy: true,
      type: "",
      message: ""
    })

    try {
      const response = await axios.post("/api/payments/checkout", {
        items: cartItems.map((item) => ({
          productId: item._id,
          quantity: item.quantity,
          price: item.price
        })),
        totalAmount: subtotal,
        paymentMethod: "card",
        cardholderName: paymentForm.cardholderName,
        cardNumber: paymentForm.cardNumber
      })

      setPaymentState({
        busy: false,
        type: "success",
        message: `${response.data.message} Transaction: ${response.data.transactionId}`
      })
      clearCart()
      navigate("/")
    } catch (error) {
      setPaymentState({
        busy: false,
        type: "error",
        message: error.response?.data?.message || "Unable to complete mock payment right now."
      })
    }
  }

  if (!cartItems.length) {
    return (
      <section className="panel">
        <p className="eyebrow">Checkout</p>
        <h2>No items ready for checkout</h2>
        <p className="section-copy">Your cart needs at least one product before checkout.</p>
      </section>
    )
  }

  return (
    <section className="checkout-layout">
      <div className="panel">
        <p className="eyebrow">Checkout</p>
        <h2>Review your order</h2>
        <div className="checkout-items">
          {cartItems.map((item) => (
            <div className="summary-row" key={item._id}>
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>Rs. {(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <aside className="panel order-summary">
        <p className="eyebrow">Payment</p>
        <h2>Total</h2>
        <div className="checkout-form">
          <input
            placeholder="Cardholder name"
            value={paymentForm.cardholderName}
            onChange={(event) =>
              setPaymentForm((current) => ({ ...current, cardholderName: event.target.value }))
            }
          />
          <input
            placeholder="16-digit test card number"
            value={paymentForm.cardNumber}
            maxLength={16}
            onChange={(event) =>
              setPaymentForm((current) => ({
                ...current,
                cardNumber: event.target.value.replace(/\D/g, "").slice(0, 16)
              }))
            }
          />
          <p className="section-copy">Use `4000000000000002` to simulate a declined payment.</p>
        </div>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        {paymentState.message ? (
          <p className={`checkout-message ${paymentState.type === "error" ? "checkout-message-error" : "checkout-message-success"}`}>
            {paymentState.message}
          </p>
        ) : null}
        <button className="primary-button full-width" onClick={handlePlaceOrder} disabled={paymentState.busy}>
          {paymentState.busy ? "Processing..." : "Place order"}
        </button>
      </aside>
    </section>
  )
}

export default Checkout
