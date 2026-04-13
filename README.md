# OZONE Marketplace

OZONE is a full stack ecommerce-style assignment project built with React, Express, MongoDB, and Node.js. It includes the main submission features for the "Authentication & Testing" practical:

- JWT authentication for users
- Mock payment integration
- Multer-based product image uploads
- Data validation on APIs
- Product catalog, cart, and checkout flow
- Responsive marketplace UI

## Tech Stack

- React + Vite
- React Router
- Axios
- Node.js + Express
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Multer

## Assignment Features Covered

### 1. JWT Authentication

- Register and login APIs return JWT tokens
- Protected route middleware validates bearer tokens
- `GET /api/students/me` restores the current user session
- Protected routes are used for profile actions, product creation, image uploads, and payment mock checkout

### 2. Payment Mockup

- Mock payment API created for checkout flow
- Returns success/failure responses
- Example declined card for testing: `4000000000000002`

### 3. Product Image Uploads

- Multer-based upload API added
- Protected upload route saves product images
- Frontend includes authenticated product upload panel

### 4. Data Validation

- Validation added for student, course, product, and payment-related request payloads
- API responses return clear error messages

### 5. Testing

- Project is ready for Postman API testing
- Suggested Postman flows are listed below

## Main UI Pages

- `/` - Marketplace landing page
- `/auth` - Login / signup page
- `/cart` - Cart page
- `/checkout` - Checkout page
- `/products/:productId` - Product detail page

## Important API Endpoints

### Auth / Users

- `POST /api/students/register`
- `POST /api/students/login`
- `GET /api/students/me`
- `GET /api/students`
- `PUT /api/students/:id`
- `DELETE /api/students/:id`

### Products

- `GET /api/products`
- `POST /api/products`

### Uploads

- `POST /api/uploads`

### Payments

- `POST /api/payments/checkout`

### Existing Academic APIs

- `GET /api/courses`
- `POST /api/courses`
- `PUT /api/courses/:id`
- `DELETE /api/courses/:id`
- `GET /api/enrollments`
- `POST /api/enrollments`
- `DELETE /api/enrollments/:id`

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file from `.env.example`

3. Make sure MongoDB is running locally

4. Seed the database:

```bash
npm run seed
```

5. Start the backend:

```bash
npm start
```

6. Start the frontend:

```bash
npm run dev
```

Frontend:

- `http://127.0.0.1:5173`

Backend:

- `http://127.0.0.1:5000`

## Environment Variables

Use a `.env` file with:

```env
MONGODB_URI=mongodb://localhost:27017/studentCourseRegistration
PORT=5000
JWT_SECRET=replace-with-a-secure-random-string
```

## Suggested Postman Testing Checklist

Test these flows and save them in your Postman collection:

1. Register user
2. Login user and save JWT token
3. Call `GET /api/students/me` with bearer token
4. Upload image using `POST /api/uploads`
5. Create product using uploaded image URL
6. Test payment success with a normal 16-digit card
7. Test payment failure with `4000000000000002`
8. Test validation failures with missing/invalid fields

## Hosting Suggestion

For assignment submission, suitable hosting options:

- Frontend: Vercel or Netlify
- Backend/API: Render or Railway
- Database: MongoDB Atlas

Recommended simple combo:

- Vercel for React frontend
- Render for Express backend
- MongoDB Atlas for database

## GitHub Upload Steps

Your repo already has a GitHub remote configured. Before pushing:

1. Check the status:

```bash
git status
```

2. Stage only this project’s files:

```bash
git add .
```

3. Commit:

```bash
git commit -m "Add JWT auth, payment mockup, product uploads, and marketplace UI"
```

4. Push:

```bash
git push origin main
```

## Submission Items To Prepare

- GitHub repository link
- Postman collection or screenshots
- Deployed project link
- Short report (2 to 3 pages)

## Notes

- Passwords are hashed using Node.js `scrypt`
- JWT is used for protected APIs
- Multer is used for image uploads
- Checkout uses a mock payment API for assignment demonstration
