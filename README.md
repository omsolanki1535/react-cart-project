# Student Course Registration Web Application

This project is a full stack student course registration system built with:

- HTML5, CSS3, and JavaScript through a React frontend
- Fetch API and JSON for client-server communication
- Node.js and Express.js for backend APIs
- MongoDB with Mongoose for data storage

## Features

- Student registration and login
- Course catalog with seat availability
- Search and filter tools for faster course discovery
- Online course enrollment and dropping
- Student profile update and delete
- Course CRUD operations
- Student directory table
- Premium dashboard-style responsive UI
- Responsive UI for desktop and mobile screens

## Project Structure

- `app.js` - Express server and MongoDB connection
- `models/Student.js` - Student schema
- `models/Course.js` - Course schema
- `models/Enrollment.js` - Enrollment schema
- `routes/students.js` - Student APIs
- `routes/courses.js` - Course APIs
- `routes/enrollments.js` - Enrollment APIs
- `src/App.jsx` - Main frontend UI
- `src/styles.css` - Application styles
- `scripts/seedProducts.js` - Seeds sample courses

## API Endpoints

- `POST /api/students/register`
- `POST /api/students/login`
- `GET /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`
- `GET /api/courses`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `GET /api/enrollments`
- `POST /api/enrollments`
- `DELETE /api/enrollments/:id`

## Local Setup

1. Install MongoDB and make sure it is running locally.
2. Create a `.env` file using `.env.example`.
3. Install dependencies:

```bash
npm install
```

4. Seed the database with sample courses:

```bash
npm run seed
```

5. Start the backend:

```bash
npm run server
```

6. In another terminal, start the frontend:

```bash
npm run dev
```

Frontend URL: `http://localhost:5173`

## Build for Production

```bash
npm run build
npm start
```

## GitHub Submission Steps

1. Initialize git in the project folder if needed:

```bash
git init
git add .
git commit -m "Build student course registration web application"
```

2. Create a new GitHub repository.
3. Connect the local project to GitHub:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git branch -M main
git push -u origin main
```

4. Share the GitHub repository link in your assignment submission.

## Notes

- Passwords are stored using Node.js `scrypt` hashing.
- The frontend stores the logged-in student in local storage to keep the demo simple.
- If you want, I can also help you add screenshots, a report, or a short viva explanation for submission.
