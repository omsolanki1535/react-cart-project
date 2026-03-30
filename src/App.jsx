import { useEffect, useMemo, useState } from "react"

const API_BASE = "/api"
const STORAGE_KEY = "student-course-registration-user"

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

const emptyCourseForm = {
  courseCode: "",
  title: "",
  instructor: "",
  department: "",
  credits: "3",
  capacity: "40",
  schedule: "",
  description: ""
}

async function request(path, options = {}) {
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      },
      ...options
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      throw new Error(data.message || "Request failed.")
    }

    return data
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("Cannot reach the backend. Start MongoDB, then run `npm run server` on port 5000.")
    }

    throw error
  }
}

function formatSeatsLeft(course) {
  return Math.max((course.capacity || 0) - (course.enrolledCount || 0), 0)
}

function App() {
  const [registerForm, setRegisterForm] = useState(emptyRegisterForm)
  const [loginForm, setLoginForm] = useState(emptyLoginForm)
  const [courseForm, setCourseForm] = useState(emptyCourseForm)
  const [editingCourseId, setEditingCourseId] = useState("")
  const [currentStudent, setCurrentStudent] = useState(() => {
    const storedStudent = localStorage.getItem(STORAGE_KEY)
    return storedStudent ? JSON.parse(storedStudent) : null
  })
  const [courses, setCourses] = useState([])
  const [enrollments, setEnrollments] = useState([])
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState({ type: "", text: "" })
  const [busyAction, setBusyAction] = useState("")
  const [courseSearch, setCourseSearch] = useState("")
  const [departmentFilter, setDepartmentFilter] = useState("All")
  const [loadingState, setLoadingState] = useState({
    catalog: true,
    enrollments: false
  })

  const departments = useMemo(() => {
    return ["All", ...new Set(courses.map((course) => course.department).filter(Boolean))]
  }, [courses])

  const enrolledCourseIds = useMemo(
    () => new Set(enrollments.map((item) => item.course?._id).filter(Boolean)),
    [enrollments]
  )

  const enrolledCredits = useMemo(
    () => enrollments.reduce((total, item) => total + (item.course?.credits || 0), 0),
    [enrollments]
  )

  const openSeats = useMemo(
    () => courses.reduce((total, course) => total + formatSeatsLeft(course), 0),
    [courses]
  )

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const searchTerm = courseSearch.trim().toLowerCase()
      const matchesSearch =
        searchTerm.length === 0 ||
        course.courseCode.toLowerCase().includes(searchTerm) ||
        course.title.toLowerCase().includes(searchTerm) ||
        course.instructor.toLowerCase().includes(searchTerm)

      const matchesDepartment =
        departmentFilter === "All" || course.department === departmentFilter

      return matchesSearch && matchesDepartment
    })
  }, [courses, courseSearch, departmentFilter])

  const featuredCourses = useMemo(() => {
    return [...courses]
      .sort((first, second) => formatSeatsLeft(first) - formatSeatsLeft(second))
      .slice(0, 3)
  }, [courses])

  useEffect(() => {
    if (currentStudent) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentStudent))
    } else {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [currentStudent])

  useEffect(() => {
    loadInitialData()
  }, [])

  useEffect(() => {
    if (currentStudent?._id) {
      loadEnrollments(currentStudent._id)
    } else {
      setEnrollments([])
    }
  }, [currentStudent?._id])

  async function loadInitialData() {
    setLoading(true)
    setLoadingState((current) => ({ ...current, catalog: true }))

    try {
      const [coursesData, studentsData] = await Promise.all([
        request("/courses"),
        request("/students")
      ])

      setCourses(coursesData)
      setStudents(studentsData)
      setFeedback({ type: "", text: "" })
    } catch (error) {
      setFeedback({ type: "error", text: error.message })
    } finally {
      setLoading(false)
      setLoadingState((current) => ({ ...current, catalog: false }))
    }
  }

  async function loadEnrollments(studentId) {
    setLoadingState((current) => ({ ...current, enrollments: true }))

    try {
      const data = await request(`/enrollments?studentId=${studentId}`)
      setEnrollments(data)
    } catch (error) {
      setFeedback({ type: "error", text: error.message })
    } finally {
      setLoadingState((current) => ({ ...current, enrollments: false }))
    }
  }

  function showMessage(type, text) {
    setFeedback({ type, text })
  }

  function updateForm(setter, event) {
    const { name, value } = event.target
    setter((current) => ({ ...current, [name]: value }))
  }

  async function handleRegister(event) {
    event.preventDefault()
    setBusyAction("register")

    try {
      const data = await request("/students/register", {
        method: "POST",
        body: JSON.stringify({
          ...registerForm,
          semester: Number(registerForm.semester)
        })
      })

      setCurrentStudent(data.student)
      setRegisterForm(emptyRegisterForm)
      await loadEnrollments(data.student._id)
      showMessage("success", "Student registered successfully.")
      await loadInitialData()
    } catch (error) {
      showMessage("error", error.message)
    } finally {
      setBusyAction("")
    }
  }

  async function handleLogin(event) {
    event.preventDefault()
    setBusyAction("login")

    try {
      const data = await request("/students/login", {
        method: "POST",
        body: JSON.stringify(loginForm)
      })

      setCurrentStudent(data.student)
      setLoginForm(emptyLoginForm)
      await loadEnrollments(data.student._id)
      showMessage("success", `Welcome, ${data.student.fullName}`)
    } catch (error) {
      showMessage("error", error.message)
    } finally {
      setBusyAction("")
    }
  }

  async function handleEnroll(courseId) {
    if (!currentStudent?._id) {
      showMessage("error", "Please log in before enrolling in a course.")
      return
    }

    setBusyAction(`enroll-${courseId}`)

    try {
      const data = await request("/enrollments", {
        method: "POST",
        body: JSON.stringify({
          studentId: currentStudent._id,
          courseId
        })
      })

      if (data.enrollment) {
        setEnrollments((current) => [data.enrollment, ...current])
      }
      showMessage("success", "Enrolled successfully.")
      await Promise.all([loadInitialData(), loadEnrollments(currentStudent._id)])
    } catch (error) {
      showMessage("error", error.message)
    } finally {
      setBusyAction("")
    }
  }

  async function handleDrop(enrollmentId) {
    if (!currentStudent?._id) {
      return
    }

    setBusyAction(`drop-${enrollmentId}`)

    try {
      const data = await request(`/enrollments/${enrollmentId}`, {
        method: "DELETE"
      })

      setEnrollments((current) => current.filter((item) => item._id !== enrollmentId))
      showMessage("success", "Enrollment removed successfully.")
      await Promise.all([loadInitialData(), loadEnrollments(currentStudent._id)])
    } catch (error) {
      showMessage("error", error.message)
    } finally {
      setBusyAction("")
    }
  }

  async function handleCourseSubmit(event) {
    event.preventDefault()

    const payload = {
      ...courseForm,
      credits: Number(courseForm.credits),
      capacity: Number(courseForm.capacity)
    }

    setBusyAction("course-save")

    try {
      const data = await request(editingCourseId ? `/courses/${editingCourseId}` : "/courses", {
        method: editingCourseId ? "PUT" : "POST",
        body: JSON.stringify(payload)
      })

      showMessage("success", editingCourseId ? "Course updated successfully." : "Course added successfully.")
      setCourseForm(emptyCourseForm)
      setEditingCourseId("")
      await loadInitialData()
    } catch (error) {
      showMessage("error", error.message)
    } finally {
      setBusyAction("")
    }
  }

  function handleCourseEdit(course) {
    setEditingCourseId(course._id)
    setCourseForm({
      courseCode: course.courseCode,
      title: course.title,
      instructor: course.instructor,
      department: course.department,
      credits: String(course.credits),
      capacity: String(course.capacity),
      schedule: course.schedule,
      description: course.description || ""
    })
  }

  async function handleCourseDelete(courseId) {
    setBusyAction(`delete-course-${courseId}`)

    try {
      const data = await request(`/courses/${courseId}`, {
        method: "DELETE"
      })

      showMessage("success", data.message)

      if (editingCourseId === courseId) {
        setEditingCourseId("")
        setCourseForm(emptyCourseForm)
      }

      await loadInitialData()
    } catch (error) {
      showMessage("error", error.message)
    } finally {
      setBusyAction("")
    }
  }

  async function handleProfileUpdate(event) {
    event.preventDefault()

    if (!currentStudent?._id) {
      return
    }

    setBusyAction("profile-save")

    try {
      const data = await request(`/students/${currentStudent._id}`, {
        method: "PUT",
        body: JSON.stringify({
          fullName: currentStudent.fullName,
          department: currentStudent.department,
          semester: Number(currentStudent.semester)
        })
      })

      setCurrentStudent(data.student)
      showMessage("success", data.message)
      await loadInitialData()
    } catch (error) {
      showMessage("error", error.message)
    } finally {
      setBusyAction("")
    }
  }

  async function handleDeleteAccount() {
    if (!currentStudent?._id) {
      return
    }

    setBusyAction("account-delete")

    try {
      const data = await request(`/students/${currentStudent._id}`, {
        method: "DELETE"
      })

      showMessage("success", data.message)
      setCurrentStudent(null)
      setEnrollments([])
      await loadInitialData()
    } catch (error) {
      showMessage("error", error.message)
    } finally {
      setBusyAction("")
    }
  }

  function logout() {
    setCurrentStudent(null)
    setEnrollments([])
    showMessage("success", "Logged out successfully.")
  }

  return (
    <div className="app-shell">
      <div className="orb orb-one" />
      <div className="orb orb-two" />

      <header className="hero">
        <div className="hero-copy-panel surface">
          <p className="eyebrow">Full Stack Development Portfolio Project</p>
          <h1>Student Course Registration Portal</h1>
          <p className="hero-text">
            A polished academic operations dashboard where students register, sign in,
            browse the live course catalog, and manage enrollments with real-time seat tracking.
          </p>

          <div className="hero-actions">
            <span className="badge">React + Fetch API</span>
            <span className="badge">Express + Node.js</span>
            <span className="badge">MongoDB + Mongoose</span>
          </div>
        </div>

        <div className="hero-grid">
          <article className="metric-card surface">
            <span>Active Courses</span>
            <strong>{courses.length}</strong>
            <p>Courses currently available for registration.</p>
          </article>
          <article className="metric-card surface">
            <span>Registered Students</span>
            <strong>{students.length}</strong>
            <p>Students stored in the MongoDB directory.</p>
          </article>
          <article className="metric-card surface">
            <span>Open Seats</span>
            <strong>{openSeats}</strong>
            <p>Total remaining seat capacity across the catalog.</p>
          </article>
          <article className="metric-card surface accent-card">
            <span>Your Credit Load</span>
            <strong>{enrolledCredits}</strong>
            <p>{currentStudent ? "Based on your current enrollments." : "Sign in to start planning your semester."}</p>
          </article>
        </div>
      </header>

      {feedback.text ? <div className={`status-banner ${feedback.type}`}>{feedback.text}</div> : null}

      <main className="dashboard">
        <section className="surface spotlight">
          <div className="section-heading">
            <div>
              <p className="kicker">Enrollment Pressure</p>
              <h2>Courses Filling Fast</h2>
            </div>
            <p className="muted">A quick view of courses with the fewest seats left.</p>
          </div>

          <div className="spotlight-grid">
            {featuredCourses.map((course) => (
              <article key={course._id} className="spotlight-card">
                <div className="spotlight-code">{course.courseCode}</div>
                <h3>{course.title}</h3>
                <p>{course.instructor}</p>
                <div className="spotlight-meta">
                  <span>{course.department}</span>
                  <span>{formatSeatsLeft(course)} seats left</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface auth-panel">
          <div className="section-heading">
            <div>
              <p className="kicker">Access</p>
              <h2>Student Authentication</h2>
            </div>
            <p className="muted">Register a student account or sign into an existing profile.</p>
          </div>

          <div className="auth-grid">
            <form className="form-card" onSubmit={handleRegister}>
              <h3>Create Account</h3>
              <div className="field-grid">
                <input name="fullName" placeholder="Full name" value={registerForm.fullName} onChange={(event) => updateForm(setRegisterForm, event)} required />
                <input type="email" name="email" placeholder="College email" value={registerForm.email} onChange={(event) => updateForm(setRegisterForm, event)} required />
                <input type="password" name="password" placeholder="Password" value={registerForm.password} onChange={(event) => updateForm(setRegisterForm, event)} required minLength={6} />
                <input name="studentId" placeholder="Student ID" value={registerForm.studentId} onChange={(event) => updateForm(setRegisterForm, event)} required />
                <input name="department" placeholder="Department" value={registerForm.department} onChange={(event) => updateForm(setRegisterForm, event)} required />
                <select name="semester" value={registerForm.semester} onChange={(event) => updateForm(setRegisterForm, event)} required>
                  {Array.from({ length: 8 }, (_, index) => (
                    <option key={index + 1} value={index + 1}>
                      Semester {index + 1}
                    </option>
                  ))}
                </select>
              </div>
              <button className="primary-button" disabled={busyAction === "register"}>
                {busyAction === "register" ? "Creating account..." : "Register Student"}
              </button>
            </form>

            <form className="form-card subtle-card" onSubmit={handleLogin}>
              <h3>Login</h3>
              <div className="field-grid">
                <input type="email" name="email" placeholder="Email address" value={loginForm.email} onChange={(event) => updateForm(setLoginForm, event)} required />
                <input type="password" name="password" placeholder="Password" value={loginForm.password} onChange={(event) => updateForm(setLoginForm, event)} required />
              </div>
              <button className="secondary-button" disabled={busyAction === "login"}>
                {busyAction === "login" ? "Signing in..." : "Login"}
              </button>

              <div className="session-card">
                <span className="session-label">Current Session</span>
                <strong>{currentStudent ? `Welcome, ${currentStudent.fullName}` : "No active student"}</strong>
                <p>
                  {currentStudent
                    ? `${currentStudent.studentId} | ${currentStudent.department} | Semester ${currentStudent.semester}`
                    : "Register or log in to unlock enrollment actions."}
                </p>
                <button type="button" className="ghost-button" onClick={logout} disabled={!currentStudent}>
                  Logout
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="surface profile-panel">
          <div className="section-heading">
            <div>
              <p className="kicker">Profile</p>
              <h2>Student Settings</h2>
            </div>
            <p className="muted">Update your academic details or remove the account from the system.</p>
          </div>

          <form className="profile-grid" onSubmit={handleProfileUpdate}>
            <input
              name="fullName"
              placeholder="Full name"
              value={currentStudent?.fullName || ""}
              onChange={(event) => setCurrentStudent((student) => ({ ...student, fullName: event.target.value }))}
              disabled={!currentStudent}
              required
            />
            <input value={currentStudent?.email || ""} disabled placeholder="Email address" />
            <input value={currentStudent?.studentId || ""} disabled placeholder="Student ID" />
            <input
              name="department"
              placeholder="Department"
              value={currentStudent?.department || ""}
              onChange={(event) => setCurrentStudent((student) => ({ ...student, department: event.target.value }))}
              disabled={!currentStudent}
              required
            />
            <select
              name="semester"
              value={currentStudent?.semester || "1"}
              onChange={(event) => setCurrentStudent((student) => ({ ...student, semester: event.target.value }))}
              disabled={!currentStudent}
              required
            >
              {Array.from({ length: 8 }, (_, index) => (
                <option key={index + 1} value={index + 1}>
                  Semester {index + 1}
                </option>
              ))}
            </select>
            <div className="button-row">
              <button className="primary-button" disabled={!currentStudent || busyAction === "profile-save"}>
                {busyAction === "profile-save" ? "Saving..." : "Save Profile"}
              </button>
              <button type="button" className="danger-button" onClick={handleDeleteAccount} disabled={!currentStudent || busyAction === "account-delete"}>
                {busyAction === "account-delete" ? "Deleting..." : "Delete Account"}
              </button>
            </div>
          </form>
        </section>

        <section className="surface full-width">
          <div className="section-heading">
            <div>
              <p className="kicker">Catalog</p>
              <h2>Available Courses</h2>
            </div>
            <p className="muted">Search the catalog, filter by department, and enroll in open sections.</p>
          </div>

          <div className="toolbar">
            <input
              value={courseSearch}
              onChange={(event) => setCourseSearch(event.target.value)}
              placeholder="Search by code, title, or instructor"
            />
            <select value={departmentFilter} onChange={(event) => setDepartmentFilter(event.target.value)}>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department === "All" ? "All Departments" : department}
                </option>
              ))}
            </select>
          </div>

          <div className="course-cards">
            {loadingState.catalog ? <div className="inline-loader">Loading courses...</div> : null}
            {filteredCourses.map((course) => {
              const seatsLeft = formatSeatsLeft(course)
              const alreadyEnrolled = enrolledCourseIds.has(course._id)

              return (
                <article key={course._id} className="course-card">
                  <div className="course-card-top">
                    <div>
                      <span className="course-chip">{course.courseCode}</span>
                      <h3>{course.title}</h3>
                    </div>
                    <span className={`seat-pill ${seatsLeft < 10 ? "seat-pill-alert" : ""}`}>
                      {seatsLeft} seats left
                    </span>
                  </div>

                  <p className="course-description">{course.description || "No description provided for this course yet."}</p>

                  <div className="course-meta-grid">
                    <span>Instructor: {course.instructor}</span>
                    <span>Department: {course.department}</span>
                    <span>Schedule: {course.schedule}</span>
                    <span>Credits: {course.credits}</span>
                  </div>

                  <div className="progress-track">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${Math.min((course.enrolledCount / course.capacity) * 100, 100)}%`
                      }}
                    />
                  </div>

                  <div className="course-card-actions">
                    <span>
                      {course.enrolledCount}/{course.capacity} enrolled
                    </span>
                    <button
                      className="primary-button"
                      onClick={() => handleEnroll(course._id)}
                      disabled={!currentStudent || alreadyEnrolled || seatsLeft < 1 || busyAction === `enroll-${course._id}`}
                    >
                      {alreadyEnrolled ? "Enrolled" : busyAction === `enroll-${course._id}` ? "Enrolling..." : "Enroll Now"}
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="surface">
          <div className="section-heading">
            <div>
              <p className="kicker">Schedule</p>
              <h2>My Enrollments</h2>
            </div>
            <p className="muted">Monitor your selected courses and adjust your credit load.</p>
          </div>

          <div className="enrollment-stack">
            {loadingState.enrollments ? <div className="inline-loader">Loading enrollments...</div> : null}
            {!currentStudent ? <p className="empty-state">Log in to view and manage your enrolled courses.</p> : null}
            {currentStudent && enrollments.length === 0 ? <p className="empty-state">No courses enrolled yet. Explore the catalog and build your semester.</p> : null}

            {enrollments.map((enrollment) => (
              <article key={enrollment._id} className="enrollment-card">
                <div>
                  <span className="course-chip">{enrollment.course?.courseCode}</span>
                  <h3>{enrollment.course?.title}</h3>
                  <p>{enrollment.course?.schedule}</p>
                  <p>{enrollment.course?.instructor}</p>
                </div>
                <div className="enrollment-actions">
                  <strong>{enrollment.course?.credits} credits</strong>
                  <button className="ghost-button" onClick={() => handleDrop(enrollment._id)} disabled={busyAction === `drop-${enrollment._id}`}>
                    {busyAction === `drop-${enrollment._id}` ? "Dropping..." : "Drop Course"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="surface">
          <div className="section-heading">
            <div>
              <p className="kicker">Admin CRUD</p>
              <h2>Course Management</h2>
            </div>
            <p className="muted">Create new courses, refine existing ones, and manage the catalog safely.</p>
          </div>

          <form className="field-grid" onSubmit={handleCourseSubmit}>
            <input name="courseCode" placeholder="Course code" value={courseForm.courseCode} onChange={(event) => updateForm(setCourseForm, event)} required />
            <input name="title" placeholder="Course title" value={courseForm.title} onChange={(event) => updateForm(setCourseForm, event)} required />
            <input name="instructor" placeholder="Instructor" value={courseForm.instructor} onChange={(event) => updateForm(setCourseForm, event)} required />
            <input name="department" placeholder="Department" value={courseForm.department} onChange={(event) => updateForm(setCourseForm, event)} required />
            <input type="number" min="1" max="6" name="credits" placeholder="Credits" value={courseForm.credits} onChange={(event) => updateForm(setCourseForm, event)} required />
            <input type="number" min="1" name="capacity" placeholder="Capacity" value={courseForm.capacity} onChange={(event) => updateForm(setCourseForm, event)} required />
            <input name="schedule" placeholder="Schedule" value={courseForm.schedule} onChange={(event) => updateForm(setCourseForm, event)} required />
            <textarea name="description" placeholder="Course description" value={courseForm.description} onChange={(event) => updateForm(setCourseForm, event)} rows="3" />

            <div className="button-row">
              <button className="secondary-button" disabled={busyAction === "course-save"}>
                {busyAction === "course-save" ? "Saving..." : editingCourseId ? "Update Course" : "Add Course"}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => {
                  setEditingCourseId("")
                  setCourseForm(emptyCourseForm)
                }}
              >
                Reset Form
              </button>
            </div>
          </form>

          <div className="management-list">
            {courses.map((course) => (
              <div key={course._id} className="management-row">
                <div>
                  <strong>
                    {course.courseCode} | {course.title}
                  </strong>
                  <p>
                    {course.instructor} | {course.enrolledCount}/{course.capacity} enrolled
                  </p>
                </div>
                <div className="button-row">
                  <button className="ghost-button" onClick={() => handleCourseEdit(course)}>
                    Edit
                  </button>
                  <button className="danger-button" onClick={() => handleCourseDelete(course._id)} disabled={busyAction === `delete-course-${course._id}`}>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface full-width">
          <div className="section-heading">
            <div>
              <p className="kicker">Directory</p>
              <h2>Student Directory</h2>
            </div>
            <p className="muted">A live MongoDB-backed table of students registered in the system.</p>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Semester</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr key={student._id}>
                    <td>{student.fullName}</td>
                    <td>{student.studentId}</td>
                    <td>{student.email}</td>
                    <td>{student.department}</td>
                    <td>{student.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {loading ? <div className="loading-pill">Loading live academic data...</div> : null}
    </div>
  )
}

export default App
