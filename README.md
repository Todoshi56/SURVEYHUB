# SurveyHub — MERN Survey Platform

A web-based survey platform for companies to collect structured feedback about their products from customers.

## Features

###  (Done ✅)
- **User Authentication**: Registration, Login, Logout, Password Change
- **Role-based Access**: Company and Customer roles
- **Company Features**: 
  - Create company profile
  - Add/Edit/Delete products
  - Create surveys with MCQ, Rating, and Text questions
  - Edit/Delete surveys
  - Quiz builder with dynamic question types

## Tech Stack

**Frontend**
- React 18 + Vite
- React Router v6
- Axios
- CSS3

**Backend**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- bcryptjs for password hashing

## Installation

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env  # Update MONGO_URI and JWT_SECRET
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

**Frontend runs on**: http://localhost:5173
**Backend runs on**: http://localhost:5000

## Database

Make sure MongoDB is running:
```bash
mongod
```

Or use MongoDB Atlas for cloud hosting.

## Project Structure

```
surveyhub/
├── backend/
│   ├── config/        # Database config
│   ├── controllers/    # Business logic
│   ├── middleware/     # Auth middleware
│   ├── models/         # MongoDB schemas
│   ├── routes/         # API endpoints
│   └── server.js       # Entry point
│
├── frontend/
│   ├── src/
│   │   ├── components/ # Reusable components
│   │   ├── context/    # Auth context
│   │   ├── pages/      # Page components
│   │   └── App.jsx     # Main app
│   └── index.html
│
└── .gitignore
```

## API Endpoints

### Auth
- `POST /api/auth/register` — Create account
- `POST /api/auth/login` — Sign in
- `PUT /api/auth/change-password` — Change password

### Company
- `GET /api/company/profile` — Get company profile
- `POST /api/company/profile` — Create/update profile

### Products
- `GET /api/products` — List products
- `POST /api/products` — Add product
- `PUT /api/products/:id` — Edit product
- `DELETE /api/products/:id` — Delete product

### Surveys
- `GET /api/surveys` — List surveys
- `POST /api/surveys` — Create survey
- `PUT /api/surveys/:id` — Edit survey
- `DELETE /api/surveys/:id` — Delete survey

## Testing

1. Register as **Company**
2. Create company profile
3. Add a product
4. Create a survey with multiple question types
5. Edit and delete as needed
## License

CSE470 Course Project
