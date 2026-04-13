import { Link } from "react-router-dom"
import { useShop } from "../context/ShopContext"

function ProductList() {
  const { products, loading, error, addToCart, getCartItem, updateQuantity, removeFromCart } = useShop()

  if (loading) {
    return <p className="status-message">Loading products...</p>
  }

  if (error) {
    return <p className="status-message error">{error}</p>
  }

  if (!products.length) {
    return <p className="status-message">No products found. Add some through the API first.</p>
  }

  return (
    <section>
      <div className="catalog-shell">
        <aside className="filter-panel">
          <p className="eyebrow">Shop By</p>
          <h2>Featured departments</h2>
          <div className="filter-links">
            <span>Computers & Accessories</span>
            <span>Work From Home Setup</span>
            <span>Audio Essentials</span>
            <span>Monitors & Displays</span>
          </div>
          <p className="section-copy">
            Prime-style layout with a simple browsing flow and quick add-to-cart actions.
          </p>
        </aside>

        <div>
          <div className="section-heading catalog-heading">
            <div>
              <p className="eyebrow">Top Picks For You</p>
              <h2>Best sellers in everyday tech</h2>
            </div>
            <p className="section-copy">Open a product for full details or add it straight to the cart.</p>
          </div>

          <div className="product-grid">
            {products.map((product) => {
              const cartItem = getCartItem(product._id)

              return (
                <article className="product-card" key={product._id}>
                  <div className="product-media-shell">
                    <img className="product-image" src={product.image} alt={product.name} />
                  </div>

                  <div className="product-card__body">
                    <div className="product-meta-row">
                      <span className="product-badge">OZONE Choice</span>
                      <span className="product-stock">{product.stock} in stock</span>
                    </div>
                    <h3>{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">Rs. {product.price}</p>
                  </div>

                  <div className="product-card__footer">
                    <Link className="secondary-button full-width" to={`/products/${product._id}`}>
                      View details
                    </Link>

                    {cartItem ? (
                      <div className="cart-stepper full-width">
                        <span className="cart-stepper-label">Product added to cart</span>
                        <div className="cart-stepper-controls">
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
                      <button
                        className="primary-button full-width"
                        onClick={() => addToCart(product)}
                        disabled={product.stock < 1}
                      >
                        Add to cart
                      </button>
                    )}
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default ProductList
