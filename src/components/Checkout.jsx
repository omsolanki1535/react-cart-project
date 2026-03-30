import { useNavigate } from "react-router-dom"
import { useShop } from "../context/ShopContext"

function Checkout() {
  const navigate = useNavigate()
  const { cartItems, subtotal, clearCart } = useShop()

  const handlePlaceOrder = () => {
    clearCart()
    navigate("/")
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
        <h2>Total</h2>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        <button className="primary-button full-width" onClick={handlePlaceOrder}>
          Place order
        </button>
      </aside>
    </section>
  )
}

export default Checkout
