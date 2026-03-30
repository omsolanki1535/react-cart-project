import { useMemo, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { useShop } from "../context/ShopContext"

function ProductDetail() {
  const { productId } = useParams()
  const { products, loading, error, addToCart } = useShop()
  const [quantity, setQuantity] = useState(1)

  const product = useMemo(
    () => products.find((item) => item._id === productId),
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

  return (
    <section className="detail-layout">
      <article className="panel detail-panel">
        <p className="product-stock">{product.stock} in stock</p>
        <h2>{product.name}</h2>
        <p className="detail-description">{product.description}</p>
        <p className="detail-price">Rs. {product.price}</p>
      </article>

      <aside className="panel">
        <p className="eyebrow">Add Product</p>
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
        <Link className="secondary-button full-width" to="/cart">
          Go to cart
        </Link>
      </aside>
    </section>
  )
}

export default ProductDetail
