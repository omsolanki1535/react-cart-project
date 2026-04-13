import { useState } from "react"
import { useShop } from "../context/ShopContext"

const emptyRegisterForm = {
  fullName: "",
  email: "",
  password: "",
  studentId: "",
  department: "",
  semester: "1"
}

const emptyLoginForm = {
  email: "",
  password: ""
}

function AuthPanel() {
  const { currentStudent, authLoading, registerStudent, loginStudent, logoutStudent } = useShop()
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [busyAction, setBusyAction] = useState("")
  const [feedback, setFeedback] = useState("")

  const updateForm = (setter, event) => {
    const { name, value } = event.target
    setter((current) => ({ ...current, [name]: value }))
  }

  const handleRegister = async (event) => {
    event.preventDefault()
    setBusyAction("register")
    setFeedback("")

    try {
      await registerStudent({
        ...registerForm,
        semester: Number(registerForm.semester)
      })
      setRegisterForm(emptyRegisterForm)
      setFeedback("Registration successful. JWT session is active.")
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to register right now.")
    } finally {
      setBusyAction("")
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    setBusyAction("login")
    setFeedback("")

    try {
      await loginStudent(loginForm)
      setLoginForm(emptyLoginForm)
      setFeedback("Login successful. Protected routes are now unlocked.")
    } catch (error) {
      setFeedback(error.response?.data?.message || "Unable to log in right now.")
    } finally {
      setBusyAction("")
    }
  }

  return (
    <section className="auth-section">
      <article className="panel auth-overview">
        <p className="eyebrow">JWT Authentication</p>
        <h2>Secure student access for protected APIs</h2>
        <p className="section-copy">
          Register or log in to receive a token-backed session. This is the auth layer we will
          reuse for uploads, payment actions, and protected product management.
        </p>
        <div className="auth-session-card">
          <span className="session-label">Current session</span>
          <strong>{currentStudent ? currentStudent.fullName : authLoading ? "Checking session..." : "Not signed in"}</strong>
          <p>
            {currentStudent
              ? `${currentStudent.email} | ${currentStudent.department} | Semester ${currentStudent.semester}`
              : "No active JWT session yet."}
          </p>
          <button className="ghost-button" onClick={logoutStudent} disabled={!currentStudent}>
            Logout
          </button>
        </div>
        {feedback ? <p className="auth-feedback">{feedback}</p> : null}
      </article>

      <article className="panel auth-form-panel">
        <div className="auth-form-grid">
          <form className="auth-form-card" onSubmit={handleRegister}>
            <h3>Create account</h3>
            <div className="auth-field-grid">
              <input name="fullName" placeholder="Full name" value={registerForm.fullName} onChange={(event) => updateForm(setRegisterForm, event)} required />
              <input name="studentId" placeholder="Student ID" value={registerForm.studentId} onChange={(event) => updateForm(setRegisterForm, event)} required />
              <input type="email" name="email" placeholder="Email address" value={registerForm.email} onChange={(event) => updateForm(setRegisterForm, event)} required />
              <input name="department" placeholder="Department" value={registerForm.department} onChange={(event) => updateForm(setRegisterForm, event)} required />
              <input type="password" name="password" placeholder="Password" value={registerForm.password} onChange={(event) => updateForm(setRegisterForm, event)} required minLength={6} />
              <select name="semester" value={registerForm.semester} onChange={(event) => updateForm(setRegisterForm, event)} required>
                {Array.from({ length: 8 }, (_, index) => (
                  <option key={index + 1} value={index + 1}>
                    Semester {index + 1}
                  </option>
                ))}
              </select>
            </div>
            <button className="primary-button full-width" disabled={busyAction === "register"}>
              {busyAction === "register" ? "Creating..." : "Register"}
            </button>
          </form>

          <form className="auth-form-card auth-form-card-soft" onSubmit={handleLogin}>
            <h3>Sign in</h3>
            <div className="auth-field-grid">
              <input type="email" name="email" placeholder="Email address" value={loginForm.email} onChange={(event) => updateForm(setLoginForm, event)} required />
              <input type="password" name="password" placeholder="Password" value={loginForm.password} onChange={(event) => updateForm(setLoginForm, event)} required />
            </div>
            <button className="secondary-button full-width" disabled={busyAction === "login"}>
              {busyAction === "login" ? "Signing in..." : "Login"}
            </button>
          </form>
        </div>
      </article>
    </section>
  )
}

export default AuthPanel
