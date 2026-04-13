import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useShop } from "../context/ShopContext"

function ProductDetail() {
  const { productId } = useParams()
  const { products, loading, error, addToCart, getCartItem, updateQuantity, removeFromCart } = useShop()
  const [quantity, setQuantity] = useState(1)

  const product = useMemo(
    () => products.find((item) => item._id === productId),
    [productId, products]
  )
  const relatedProducts = useMemo(
    () => products.filter((item) => item._id !== productId).slice(0, 4),
    [productId, products]
  )

  if (loading) {
    return <p className="status-message">Loading product...</p>
  }

  if (error) {
    return <p className="status-message error">{error}</p>
  }

  if (!product) {
    return (
      <section className="panel">
        <p className="status-message">Product not found.</p>
        <Link className="secondary-button" to="/">
          Back to products
        </Link>
      </section>
    )
  }

  const cartItem = getCartItem(product._id)

  return (
    <div className="detail-page-layout">
      <section className="detail-layout">
        <article className="panel detail-panel">
          <img className="detail-image" src={product.image} alt={product.name} />
          <div className="detail-meta-strip">
            <span className="tag-pill">OZONE Choice</span>
            <span className="tiny-copy">{product.stock} in stock</span>
          </div>
          <h2>{product.name}</h2>
          <div className="rating-row">
            <span className="stars">★★★★★</span>
            <span className="tiny-copy">4.6 customer rating</span>
          </div>
          <p className="detail-description">{product.description}</p>
          <div className="price-stack">
            <p className="detail-price">Rs. {product.price}</p>
            <span className="original-price">M.R.P. Rs. {Math.round(product.price * 1.18)}</span>
          </div>
          <div className="detail-highlights">
            <span>Fast delivery available</span>
            <span>Protected payment demo supported</span>
            <span>Secure checkout with JWT session</span>
          </div>
        </article>

        <aside className="panel detail-buy-box">
          <p className="eyebrow">Buy Now</p>
          <h3>Ready to add this to your setup?</h3>
          <p className="section-copy">Choose quantity, add to cart, and continue to the mock payment flow.</p>
          {cartItem ? (
            <div className="detail-stepper">
              <p className="added-copy">Product added to cart</p>
              <div className="cart-stepper-controls full-width">
                <button
                  className="stepper-button"
                  onClick={() =>
                    cartItem.quantity <= 1
                      ? removeFromCart(product._id)
                      : updateQuantity(product._id, cartItem.quantity - 1)
                  }
                >
                  -
                </button>
                <span className="stepper-value">{cartItem.quantity}</span>
                <button
                  className="stepper-button"
                  onClick={() => updateQuantity(product._id, cartItem.quantity + 1)}
                  disabled={cartItem.quantity >= product.stock}
                >
                  +
                </button>
              </div>
            </div>
          ) : (
            <>
              <label className="quantity-field" htmlFor="quantity">
                Quantity
              </label>
              <input
                id="quantity"
                className="quantity-input"
                type="number"
                min="1"
                max={product.stock || 1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value) || 1)}
              />
              <button
                className="primary-button full-width"
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock < 1}
              >
                Add to cart
              </button>
            </>
          )}
          <Link className="secondary-button full-width" to="/cart">
            Go to cart
          </Link>
        </aside>
      </section>

      <section className="content-band">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Customers Also Bought</p>
            <h2>More products that fit this setup</h2>
          </div>
          <p className="section-copy">A stronger detail page should still keep people browsing, not dead-end after one product.</p>
        </div>

        <div className="recommend-grid">
          {relatedProducts.map((item) => (
            <Link className="recommend-card" key={item._id} to={`/products/${item._id}`}>
              <img src={item.image} alt={item.name} />
              <div>
                <strong>{item.name}</strong>
                <span>Rs. {item.price}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

export default ProductDetail
