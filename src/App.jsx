import { useState } from "react"
import { Link, NavLink, Route, Routes, useNavigate } from "react-router-dom"
import ProductDetail from "./components/ProductDetail"
import Cart from "./components/Cart"
import Checkout from "./components/Checkout"
import HomePage from "./components/HomePage"
import AuthPage from "./components/AuthPage"
import LoadingOverlay from "./components/LoadingOverlay"
import { useShop } from "./context/ShopContext"

function AppFrame() {
  const { totalItems, products, currentStudent, loading, authLoading } = useShop()
  const [searchQuery, setSearchQuery] = useState("")
  const navigate = useNavigate()

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    navigate("/")
  }

  return (
    <div className="app-shell">
      {loading || authLoading ? <LoadingOverlay /> : null}

      <header className="site-header">
        <div className="site-header__top">
          <Link className="brand-mark" to="/">
            <span className="brand-word">O</span>
            <span className="brand-accent">ZONE</span>
          </Link>

          <form className="header-search" onSubmit={handleSearchSubmit}>
            <span className="header-search__tag">All</span>
            <input
              className="header-search__input"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search gaming, work setup, audio, and lifestyle gear"
            />
            <button className="header-search__button" type="submit">
              Search
            </button>
          </form>

          <div className="header-status">
            <span>{currentStudent ? `Hello, ${currentStudent.fullName}` : "Sign in for faster checkout"}</span>
            <strong>{currentStudent ? "JWT Secured" : "Student Auth"}</strong>
          </div>

          <Link className="header-cart" to="/cart">
            <span>Cart</span>
            <strong>{totalItems}</strong>
          </Link>
        </div>

        <div className="site-header__bottom">
          <nav className="main-nav" aria-label="Main navigation">
            <NavLink className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`} to="/">
              Home
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`} to="/auth">
              Login / Signup
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`} to="/checkout">
              Checkout
            </NavLink>
            <NavLink className={({ isActive }) => `nav-link${isActive ? " nav-link-active" : ""}`} to="/cart">
              Cart
            </NavLink>
          </nav>

          <p className="site-header__meta">
            {products.length} live products, protected APIs, image uploads, and payment mockups
          </p>
        </div>
      </header>

      <main className="page-shell">
        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/products/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
        </Routes>
      </main>

      <footer className="site-footer">
        <div className="site-footer__brand">
          <strong>OZONE</strong>
          <p>Marketplace UI, JWT auth, product uploads, and payment mockup in one polished assignment build.</p>
        </div>

        <div className="site-footer__links">
          <div>
            <span className="footer-label">Explore</span>
            <Link to="/">Home</Link>
            <Link to="/cart">Cart</Link>
            <Link to="/checkout">Checkout</Link>
          </div>
          <div>
            <span className="footer-label">Account</span>
            <Link to="/auth">Login / Signup</Link>
            <Link to="/auth">Upload Products</Link>
          </div>
          <div>
            <span className="footer-label">Assignment</span>
            <span>JWT Authentication</span>
            <span>Multer Upload</span>
            <span>Payment Mock API</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default AppFrame
