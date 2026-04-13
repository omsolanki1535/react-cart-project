import { Link } from "react-router-dom"
import { useShop } from "../context/ShopContext"

const categoryCards = [
  { title: "Gaming Gear", copy: "Low-latency accessories, RGB setups, and streaming must-haves." },
  { title: "Work Essentials", copy: "Desk upgrades, webcams, keyboards, and focused productivity picks." },
  { title: "Audio Lounge", copy: "Headphones, speakers, and immersive sound gear for every room." },
  { title: "Creator Setup", copy: "Monitors, webcams, and flexible tools for editing and meetings." }
]

const promoBlocks = [
  { title: "Lightning Deals", copy: "Fast-moving prices on work, gaming, and audio essentials." },
  { title: "Budget Finds", copy: "Popular accessories under a friendlier price range." },
  { title: "Premium Picks", copy: "Flagship gear for creators who want cleaner setups." },
  { title: "Starter Bundles", copy: "Beginner-friendly desk upgrade ideas and must-have combos." }
]

function ProductShelf({ title, eyebrow, copy, products, getCartItem, addToCart, updateQuantity, removeFromCart }) {
  return (
    <section className="content-band">
      <div className="section-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <p className="section-copy">{copy}</p>
      </div>

      <div className="market-grid">
        {products.map((product) => (
          <ProductCard
            key={product._id}
            product={product}
            cartItem={getCartItem(product._id)}
            addToCart={addToCart}
            updateQuantity={updateQuantity}
            removeFromCart={removeFromCart}
          />
        ))}
      </div>
    </section>
  )
}

function ProductCard({ product, cartItem, addToCart, updateQuantity, removeFromCart }) {
  const originalPrice = Math.round(product.price * 1.18)
  const rating = (4 + ((product.price % 10) / 20)).toFixed(1)

  return (
    <article className="market-card">
      <div className="market-card__media">
        <img className="market-card__image" src={product.image} alt={product.name} />
      </div>

      <div className="market-card__body">
        <div className="market-card__meta">
          <span className="tag-pill">OZONE Pick</span>
          <span className="tiny-copy">{product.stock} in stock</span>
        </div>
        <h3>{product.name}</h3>
        <div className="rating-row">
          <span className="stars">★★★★★</span>
          <span className="tiny-copy">{rating} rating</span>
        </div>
        <p className="section-copy">{product.description}</p>
        <div className="price-stack">
          <p className="price-copy">Rs. {product.price}</p>
          <span className="original-price">M.R.P. Rs. {originalPrice}</span>
        </div>
        <span className="deal-badge">Limited time deal</span>
      </div>

      <div className="market-card__actions">
        <Link className="secondary-button full-width" to={`/products/${product._id}`}>
          View details
        </Link>

        {cartItem ? (
          <div className="cart-stepper full-width">
            <span className="cart-stepper-label">Added to cart</span>
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
          <button className="primary-button full-width" onClick={() => addToCart(product)} disabled={product.stock < 1}>
            Add to cart
          </button>
        )}
      </div>
    </article>
  )
}

function HomePage({ searchQuery = "" }) {
  const { products, addToCart, getCartItem, updateQuantity, removeFromCart } = useShop()
  const normalizedSearch = searchQuery.trim().toLowerCase()
  const visibleProducts = normalizedSearch
    ? products.filter((product) =>
        [product.name, product.description, product.category]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(normalizedSearch))
      )
    : products

  const featured = visibleProducts.slice(0, 4)
  const trending = [...visibleProducts].reverse().slice(0, 8)
  const spotlight = visibleProducts.slice(0, 3)
  const dealRush = visibleProducts.slice(0, 6)
  const underBudget = [...visibleProducts].sort((first, second) => first.price - second.price).slice(0, 4)
  const topRated = [...visibleProducts].sort((first, second) => second.stock - first.stock).slice(0, 4)

  return (
    <div className="home-layout">
      <section className="hero-banner">
        <div className="hero-banner__copy">
          <p className="eyebrow">Main Storefront</p>
          <h1>OZONE feels like a real online mall now, not a crowded assignment page.</h1>
          <p className="hero-text">
            Browse category-led collections, discover featured drops, add products straight to the
            cart, and move into secure student login, payment mockup, and upload workflows only when
            you need them.
          </p>
          <div className="hero-banner__actions">
            <Link className="primary-button" to="/auth">
              Login / Signup
            </Link>
            <Link className="secondary-button" to="/cart">
              Open cart
            </Link>
          </div>
        </div>

        <div className="hero-banner__visual">
          {spotlight.map((product, index) => (
            <article className={`floating-tile tile-${index + 1}`} key={product._id}>
              <img src={product.image} alt={product.name} />
              <strong>{product.name}</strong>
              <span>Rs. {product.price}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="category-strip">
        {categoryCards.map((category) => (
          <article className="category-card" key={category.title}>
            <p className="eyebrow">Category</p>
            <h3>{category.title}</h3>
            <p className="section-copy">{category.copy}</p>
          </article>
        ))}
      </section>

      <section className="promo-ribbon">
        {promoBlocks.map((block) => (
          <article className="promo-ribbon__card" key={block.title}>
            <p className="eyebrow">Shop Event</p>
            <h3>{block.title}</h3>
            <p className="section-copy">{block.copy}</p>
          </article>
        ))}
      </section>

      {normalizedSearch && visibleProducts.length === 0 ? (
        <section className="panel">
          <p className="eyebrow">Search Results</p>
          <h2>No products matched "{searchQuery}"</h2>
          <p className="section-copy">Try a different word like keyboard, audio, webcam, or monitor.</p>
        </section>
      ) : null}

      {trending.length ? (
        <ProductShelf
          title={normalizedSearch ? `Search results for "${searchQuery}"` : "Shop the most clicked setup drops"}
          eyebrow={normalizedSearch ? "Filtered Products" : "Trending Now"}
          copy="A large landing page with repeat browsing shelves, promo blocks, and better product discovery."
          products={trending}
          getCartItem={getCartItem}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      ) : null}

      <section className="dual-panels">
        <article className="feature-panel">
          <p className="eyebrow">Featured Collection</p>
          <h2>Setup refresh for work, gaming, and creators</h2>
          <div className="mini-grid">
            {featured.map((product) => (
              <Link className="mini-product" key={product._id} to={`/products/${product._id}`}>
                <img src={product.image} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span>Rs. {product.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </article>

        <article className="feature-panel feature-panel--accent">
          <p className="eyebrow">Why OZONE</p>
          <h2>Cleaner pages, protected APIs, and proper shopping flow</h2>
          <ul className="feature-list">
            <li>Dedicated homepage instead of one long hectic screen</li>
            <li>Separate auth page for login, signup, and product uploads</li>
            <li>JWT-secured APIs, payment mockup, and image upload support</li>
            <li>Responsive layout with layered cards, motion, and 3D depth</li>
          </ul>
        </article>
      </section>

      <section className="triple-spotlight">
        <article className="spotlight-card">
          <p className="eyebrow">Under Budget</p>
          <h3>Quick picks under your comfort zone</h3>
          <div className="stacked-links">
            {underBudget.map((product) => (
              <Link key={product._id} to={`/products/${product._id}`}>
                {product.name}
              </Link>
            ))}
          </div>
        </article>

        <article className="spotlight-card spotlight-card--wide">
          <p className="eyebrow">Deal Rush</p>
          <h3>Fresh offers to keep the front page alive</h3>
          <div className="deal-rush-grid">
            {dealRush.map((product) => (
              <Link className="deal-rush-item" key={product._id} to={`/products/${product._id}`}>
                <img src={product.image} alt={product.name} />
                <span>{product.name}</span>
              </Link>
            ))}
          </div>
        </article>

        <article className="spotlight-card">
          <p className="eyebrow">Top Rated</p>
          <h3>Most trusted desk upgrades</h3>
          <div className="stacked-links">
            {topRated.map((product) => (
              <Link key={product._id} to={`/products/${product._id}`}>
                {product.name}
              </Link>
            ))}
          </div>
        </article>
      </section>

      {underBudget.length ? (
        <ProductShelf
          title="Best value buys for quick setup upgrades"
          eyebrow="Budget Finds"
          copy="A second product shelf keeps the homepage feeling fuller and closer to a big retail front page."
          products={[...underBudget, ...topRated]}
          getCartItem={getCartItem}
          addToCart={addToCart}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
        />
      ) : null}
    </div>
  )
}

export default HomePage
