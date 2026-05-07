# SurveyHub — MERN Survey Platform

A web-based survey platform where companies collect verified product feedback. To prevent fake responses, surveys can only be taken by users whose **sample request has been approved by the product-owning company** — so feedback comes from people who actually have the product.

## Features

### Authentication
- Register / login / logout / change password (JWT, bcrypt-hashed passwords).
- Two roles: **Company** and **Customer**.
- Phone number is required for every account and must be unique.

### Company workflow
- Create a company profile (name, description, industry, website, optional public phone).
- Add, edit, and delete products — each product can have an image (PNG / JPG / GIF / WEBP, up to 5 MB).
- Build surveys with three question types: **MCQ**, **Rating (1–5)**, **Text**.
- Review every sample request for the company's products on a dedicated dashboard, then **Approve** or **Decline**.
- Open per-survey **Analytics**: total responses, average rating, full results table, Chart.js bar chart, and CSV export.

### Customer / cross-company workflow
- Browse products from every company; request a sample with an optional message.
- Browse active surveys; the **Take Survey** button only appears once the company has approved the user's sample request for that product.
- Companies can also browse other companies' products / surveys and request samples — but cannot survey or request samples of their own products.

### Submission integrity
- Backend rejects any survey submission without an approved `SampleRequest` for `(requester, product)` — so a hand-crafted POST cannot bypass the rule.
- Customers and companies can each submit a survey for a given product **at most once**.
- After submitting, revisiting the survey link redirects to the response report (every selected option / rating is highlighted in the original question layout).

## Tech Stack

**Frontend** — React 18 + Vite, React Router v6, Axios, Chart.js (`react-chartjs-2`), plain CSS.
**Backend** — Node.js + Express, MongoDB + Mongoose, JWT auth, bcryptjs, Multer (uploads).

## Installation

### Prerequisites
- Node.js 18+
- A running MongoDB instance (local `mongod` or MongoDB Atlas)

### Backend
```bash
cd backend
npm install
cp .env.example .env       # then fill in the values
npm run dev                # nodemon, port 5000
```

The first time you run it, Mongoose will build the unique index on `User.phone` automatically.

### Frontend
```bash
cd frontend
npm install
npm run dev                # Vite, port 5173
```

The Vite dev server proxies `/api` and `/uploads` to `http://localhost:5000`, so no extra config is needed in development.

| Service  | URL                                      |
| -------- | ---------------------------------------- |
| Frontend | http://localhost:5173                    |
| Backend  | http://localhost:5000                    |

## How it works (typical flow)

1. **Company** registers → creates company profile → adds products (with images) → creates surveys for those products.
2. **Customer or another company** browses `/products`, finds something interesting, clicks **Request Sample**, and writes an optional message.
3. The product-owning company opens **Sample Requests** in their nav, reviews the request (sees requester name, email, phone, message), and clicks **Approve** or **Decline**.
4. Once approved, the requester sees **Take Survey** on `/surveys` for that product. They submit; the company sees the response in **Analytics** (totals, averages, table, chart, CSV).

## Project Structure

```
surveyhub/
├── backend/
│   ├── config/                  # MongoDB connection
│   ├── controllers/             # auth, company, product, survey, response, sampleRequest
│   ├── middleware/              # authMiddleware (protect, companyOnly), uploadMiddleware (multer)
│   ├── models/                  # User, Company, Product, Survey, Response, SampleRequest
│   ├── routes/                  # one router per resource
│   ├── uploads/products/        # uploaded product images (gitignored)
│   ├── .env.example
│   └── server.js
│
└── frontend/
    └── src/
        ├── components/          # Navbar, ProtectedRoute
        ├── context/             # AuthContext
        ├── pages/               # Login, Register, dashboards, browse / detail / response views, analytics, sample requests
        ├── App.jsx              # router
        ├── main.jsx
        └── index.css
```

## API Endpoints

### Auth
- `POST /api/auth/register` — body: `{ name, email, password, phone, role }`
- `POST /api/auth/login` — body: `{ email, password }`
- `PUT /api/auth/change-password` — auth required

### Company profile (companies only)
- `GET /api/company/profile`
- `POST /api/company/profile` — body: `{ companyName, description, industry, website, phone }`

### Products
- `GET /api/products` — companies, list **own** products
- `GET /api/products/browse` — any authenticated user, list all products
- `POST /api/products` — multipart, `image` field optional
- `PUT /api/products/:id` — multipart; pass `removeImage=true` to clear the existing image
- `DELETE /api/products/:id`

### Surveys
- `GET /api/surveys/browse/active` — public, active surveys for the customer browse list
- `GET /api/surveys/:id`
- `GET /api/surveys` — companies, list **own** surveys
- `POST /api/surveys` / `PUT /api/surveys/:id` / `DELETE /api/surveys/:id`

### Responses
- `POST /api/responses/submit` — requires an approved sample request for the survey's product
- `GET /api/responses/check/:surveyId` — has the current user already submitted?
- `GET /api/responses/user-response/:surveyId` — the requester's own submission
- `GET /api/responses/survey/:surveyId` — companies, every response for a survey they own
- `GET /api/responses/analytics/:surveyId` — companies, aggregated stats for the analytics page

### Sample requests
- `POST /api/sample-requests` — body: `{ productId, message }`
- `GET /api/sample-requests/mine` — the requester's own requests
- `GET /api/sample-requests/company` — companies, every request for products they own
- `PATCH /api/sample-requests/:id/status` — companies, body: `{ status: "approved" | "declined" | "pending" }`

### Static
- `GET /uploads/products/<filename>` — uploaded product images

## Testing the full flow

1. Register two accounts (e.g. one company "Acme" and one customer).
2. As Acme: create the company profile, add a product (with an image), create a survey for it.
3. Log in as the customer: open **Products**, click **Request Sample** on Acme's product.
4. Log back in as Acme: open **Sample Requests**, click **Approve**.
5. Log in as the customer again: **Surveys** now shows **Take Survey** on Acme's survey. Submit it.
6. Back as Acme: open **My Surveys → View Results** to see totals, averages, the response table, chart, and **Download CSV**.

## License

CSE470 Course Project.
