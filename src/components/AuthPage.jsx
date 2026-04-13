import AuthPanel from "./AuthPanel"
import ProductUploadPanel from "./ProductUploadPanel"
import { useShop } from "../context/ShopContext"

function AuthPage() {
  const { currentStudent } = useShop()

  return (
    <div className="auth-page-layout">
      <section className="auth-page-hero">
        <p className="eyebrow">Student Access</p>
        <h1>Login and signup now live on their own page.</h1>
        <p className="hero-text">
          This route keeps authentication, protected uploads, and assignment-specific admin actions
          away from the storefront so the homepage can breathe like a real marketplace.
        </p>
      </section>

      <section className="auth-info-grid">
        <article className="auth-info-card">
          <p className="eyebrow">Secure Access</p>
          <h3>JWT-backed student session</h3>
          <p className="section-copy">Register or login once, and the protected APIs for checkout, profile, and uploads stay unlocked.</p>
        </article>
        <article className="auth-info-card">
          <p className="eyebrow">Admin Utility</p>
          <h3>Protected product upload area</h3>
          <p className="section-copy">Image upload and product creation stay off the storefront homepage so the shop feels cleaner.</p>
        </article>
        <article className="auth-info-card">
          <p className="eyebrow">Submission Ready</p>
          <h3>Testing and demo flows in one place</h3>
          <p className="section-copy">This page now doubles as your assignment operations center for auth and upload demonstrations.</p>
        </article>
      </section>

      <AuthPanel />
      {currentStudent ? <ProductUploadPanel /> : null}
    </div>
  )
}

export default AuthPage
