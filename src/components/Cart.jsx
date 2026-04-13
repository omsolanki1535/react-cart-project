import { Link } from "react-router-dom"
import { useShop } from "../context/ShopContext"

function Cart() {
  const { cartItems, subtotal, updateQuantity, removeFromCart, clearCart } = useShop()

  if (!cartItems.length) {
    return (
      <section className="panel">
        <p className="eyebrow">Cart</p>
        <h2>Your cart is empty</h2>
        <p className="section-copy">Add products from the catalog and they will appear here.</p>
        <Link className="primary-button" to="/">
          Continue shopping
        </Link>
      </section>
    )
  }

  return (
    <section className="cart-layout">
      <div className="cart-list">
        {cartItems.map((item) => (
          <article className="panel cart-row" key={item._id}>
            <div className="cart-item-info">
              <img className="cart-item-image" src={item.image} alt={item.name} />
              <div>
              <h3>{item.name}</h3>
              <p className="product-description">{item.description}</p>
              <p className="product-price">Rs. {item.price}</p>
              </div>
            </div>
            <div className="cart-controls">
              <input
                className="quantity-input"
                type="number"
                min="1"
                max={item.stock || item.quantity}
                value={item.quantity}
                onChange={(event) => updateQuantity(item._id, Number(event.target.value))}
              />
              <button className="secondary-button" onClick={() => removeFromCart(item._id)}>
                Remove
              </button>
            </div>
          </article>
        ))}
      </div>

      <aside className="panel order-summary">
        <p className="eyebrow">Cart Summary</p>
        <h2>Order summary</h2>
        <div className="summary-row">
          <span>Items</span>
          <span>{cartItems.length}</span>
        </div>
        <div className="summary-row">
          <span>Subtotal</span>
          <span>Rs. {subtotal.toFixed(2)}</span>
        </div>
        <Link className="primary-button full-width" to="/checkout">
          Proceed to checkout
        </Link>
        <button className="ghost-button full-width" onClick={clearCart}>
          Clear cart
        </button>
      </aside>
    </section>
  )
}

export default Cart
