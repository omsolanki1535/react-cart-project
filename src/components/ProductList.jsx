import { Link } from "react-router-dom"
import { useShop } from "../context/ShopContext"

function ProductList() {
  const { products, loading, error, addToCart } = useShop()

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
      <div className="section-heading">
        <div>
          <p className="eyebrow">Catalog</p>
          <h2>Browse Products</h2>
        </div>
        <p className="section-copy">Open a product for details or add it directly to the cart.</p>
      </div>

      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product._id}>
            <div className="product-card__body">
              <p className="product-stock">{product.stock} in stock</p>
              <h3>{product.name}</h3>
              <p className="product-description">{product.description}</p>
              <p className="product-price">Rs. {product.price}</p>
            </div>
            <div className="product-card__actions">
              <Link className="secondary-button" to={`/products/${product._id}`}>
                View details
              </Link>
              <button
                className="primary-button"
                onClick={() => addToCart(product)}
                disabled={product.stock < 1}
              >
                Add to cart
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ProductList
