# TechHouse Backend

A REST API for **TechHouse**, an online electronics & home-appliance store. The API powers user authentication and a product catalog, and is designed to grow into the backend for a full e-commerce experience (cart, orders, payments).

This document explains **what the API does, why it exists, how a request flows through it, every available endpoint, and what is planned next.**

---

## 1. Business Goals

TechHouse sells consumer electronics (phones, laptops, kitchen appliances, etc.) through a web/mobile storefront. The backend exists to:

1. **Let customers create accounts and log in securely**, so the store can personalize the experience, track orders, and protect user data.
2. **Serve an up-to-date product catalog** (name, price, category, stock, description, image) that the storefront frontend can render, search, and filter.
3. **Allow store administrators to manage inventory** (create, update, delete products) without touching the database directly.
4. **Lay the groundwork for a shopping cart and checkout flow**, so customers can collect products before purchasing.

In short: the API is the single source of truth for *accounts* and *products*, and the contract the frontend (web/mobile) talks to.

---

## 2. Tech Stack

| Concern              | Choice                          |
|-----------------------|----------------------------------|
| Runtime               | Node.js (ES Modules)            |
| Web framework         | Express 5                       |
| Auth                  | JSON Web Tokens (`jsonwebtoken`)|
| Password hashing      | `bcrypt`                         |
| ID generation         | `uuid`                           |
| Cross-origin requests | `cors`                           |
| Dev workflow          | `nodemon`                        |
| Data storage          | **In-memory arrays** (no database yet — see [Roadmap](#7-roadmap--planned-features)) |

---

## 3. Project Structure

```
backend/
└── src/
    ├── app.js                  # Express app setup, middleware, route mounting
    ├── server.js               # Starts the HTTP server (port 5500)
    ├── data/
    │   └── db.js               # In-memory "database": users[] and productsDB[]
    ├── routes/
    │   ├── authRoutes.js       # /api/auth routes
    │   └── productRoutes.js    # /api/products (and /api/product) routes
    └── controllers/
        ├── authController.js   # register / login logic
        ├── productController.js# product CRUD logic
        └── cartController.js   # placeholder — cart feature not implemented yet
```

---

## 4. Request/Response Cycle

Every request to the API follows the same path through Express:

```
Client (browser / Postman / mobile app)
   │  HTTP request (e.g. POST /api/auth/login)
   ▼
app.js
   │  1. cors()           → allows cross-origin requests from the frontend
   │  2. express.json()   → parses the JSON request body into req.body
   ▼
Router (authRoutes.js / productRoutes.js)
   │  Matches the HTTP method + path to a controller function
   ▼
Controller (authController.js / productController.js)
   │  1. Validate input        (are required fields present?)
   │  2. Read/modify "database" (users[] or productsDB[] in data/db.js)
   │  3. Apply business logic   (hash password, compare password, sign JWT, etc.)
   │  4. Build a JSON response  ({ success, message, data })
   ▼
Client receives JSON response + HTTP status code
```

**Concrete example — logging in:**

1. Client sends `POST /api/auth/login` with `{ email, password }`.
2. `express.json()` parses the body.
3. `authRoutes.js` routes the request to `login()` in `authController.js`.
4. `login()`:
   - Validates that both fields exist (`400` if not).
   - Looks up the user by email in the in-memory `users` array (`404` if not found).
   - Compares the supplied password against the stored bcrypt hash (`403` if it doesn't match).
   - Signs a JWT containing `{ id, email }`, valid for **7 days**.
   - Returns `200` with `{ message: "Login successfull", token }`.
5. The client stores the token (e.g. in localStorage) and attaches it to future requests that need authentication (e.g. `Authorization: Bearer <token>`).

> **Note:** No route currently *verifies* the JWT on protected endpoints — token issuance works, but there is no auth middleware yet that blocks unauthenticated access to product-management routes. See [Roadmap](#7-roadmap--planned-features).

---

## 5. Getting Started

```bash
cd backend
npm install
npm run dev      # starts the server with nodemon on port 5500
```

The API will be available at `http://localhost:5500`.

```bash
curl http://localhost:5500/
# { "message": "API is running!" }
```

---

## 6. API Reference

Base URL: `http://localhost:5500`

### 6.1 Health Check

| Method | Path | Description |
|--------|------|--------------|
| GET    | `/`  | Confirms the API is running. |

**Response `200`:**
```json
{ "message": "API is running!" }
```

---

### 6.2 Authentication — `/api/auth`

#### `POST /api/auth/register`
Creates a new user account.

**Body:**
```json
{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Cycle:**
1. Validate all three fields are present → `400` if missing.
2. Check `email` isn't already registered → `409` if it exists.
3. Hash the password with `bcrypt` (salt rounds: 10).
4. Push the new user `{ id, username, email, password (hashed) }` into the in-memory `users` array.
5. Respond `201`.

**Responses:**
| Status | Body |
|--------|------|
| 201 | `{ "message": "Registered successfully!" }` |
| 400 | `{ "message": "All fields are required!" }` |
| 409 | `{ "message": "User email already exist!" }` |

#### `POST /api/auth/login`
Authenticates a user and issues a JWT.

**Body:**
```json
{ "email": "john@example.com", "password": "secret123" }
```

**Responses:**
| Status | Body |
|--------|------|
| 200 | `{ "message": "Login successfull", "token": "<jwt>" }` |
| 400 | `{ "message": "All fields are required!" }` |
| 403 | `{ "message": "Password is incorrect!" }` |
| 404 | `{ "message": "User email does not exist!" }` |

The JWT is signed with a static secret (`SECRET_KEY_FOR_TECH_HOUSE`) and expires after **7 days**. It encodes `{ id, email }`.

---

### 6.3 Products — `/api/products` (alias: `/api/product`)

Both `/api/products` and `/api/product` are mounted to the same router, so either prefix works.

#### `GET /api/products`
Returns the full product catalog.

**Response `200`:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": "uuid",
      "name": "Iphone 17 pro max",
      "price": 1400,
      "category": "Smartphones",
      "inStock": 30,
      "description": "...",
      "imageUrl": "...",
      "createdAt": "2026-..."
    }
  ]
}
```

#### `GET /api/products/:id`
Fetches a single product by its UUID.

| Status | Body |
|--------|------|
| 200 | `{ "success": true, "data": { ...product } }` |
| 404 | `{ "success": false, "message": "Product doesn't exist in db !!!" }` |

> ⚠️ **Known bug:** the lookup currently compares a product to itself (`p.id === p.id`) instead of `p.id === id`, so it always matches the *first* product in the array regardless of the `:id` requested. This needs to be fixed before the endpoint is reliable.

#### `POST /api/products`
Creates a new product (admin/inventory action).

**Body:**
```json
{
  "name": "AirPods Pro 3",
  "price": 250,
  "category": "Accessories",
  "inStock": 50,
  "description": "Noise-cancelling earbuds",
  "imageUrl": "https://..."
}
```

**Cycle:**
1. Validate `name`, `price`, `category` are present → `400` if not.
2. Generate a UUID, coerce `price`/`inStock` to numbers, stamp `createdAt`.
3. Push into `productsDB`.
4. Respond `201` with the created product.

| Status | Body |
|--------|------|
| 201 | `{ "success": true, "message": "Product successfully added to db", "product": { ... } }` |
| 400 | `{ "message": "Name, price and category are required!" }` |

#### `PUT /api/products/:id`
Updates an existing product. Only the fields provided in the body are changed; everything else keeps its previous value.

| Status | Body |
|--------|------|
| 200 | `{ "success": false, "message": "Procuct succesfully updated !", "data": { ...updatedProduct } }` |
| 404 | `{ "succes": false, "message": "Error occured!, Product not found." }` |

> ⚠️ The success response incorrectly sets `"success": false` — this is a bug, not intentional behavior.

#### `DELETE /api/products/:id`
Removes a product from the catalog.

| Status | Body |
|--------|------|
| 200 | `{ "success": true, "message": "Mahsulot muvaffaqiyatli o'chirildi." }` |
| 404 | `{ "success": false, "message": "Product not found" }` |

---

### 6.4 Cart — `/api/cart` *(not yet implemented)*

A `cartController.js` file exists as a placeholder, and a cart is part of the business goal (customers need to collect products before checkout), but **no routes or logic have been written yet**. See the roadmap below.

---

## 7. Roadmap / Planned Features

These are the features and fixes needed to move from "catalog + auth demo" to a production-ready store backend:

- [ ] **Persistent database** — replace the in-memory `users`/`productsDB` arrays (which reset on every server restart) with a real database (e.g. MongoDB or PostgreSQL).
- [ ] **Shopping cart** — implement `cartController.js` and `/api/cart` routes: add item, remove item, update quantity, view cart, clear cart.
- [ ] **Order/checkout flow** — convert a cart into an order, track order status, integrate payment.
- [ ] **Auth middleware** — verify JWTs on protected routes (e.g. only logged-in users can manage their cart; only admins can create/update/delete products).
- [ ] **Role-based access control** — distinguish regular customers from store admins.
- [ ] **Fix `getProduct` lookup bug** — compare `p.id === id`, not `p.id === p.id`.
- [ ] **Fix `updateProduct` response flag** — should report `"success": true` on a successful update.
- [ ] **Move JWT secret to environment variables** — `SECRET_KEY_FOR_TECH_HOUSE` is currently hard-coded in source; it should come from a `.env` file and never be committed.
- [ ] **Pagination & filtering** — `GET /api/products` should support query params like `?category=`, `?page=`, `?limit=` as the catalog grows.
- [ ] **Input validation library** — replace manual `if (!field)` checks with a schema validator (e.g. Joi/Zod) for more robust and consistent error messages.

---

## 8. Summary

TechHouse Backend currently provides:
- **Account creation & login** with hashed passwords and JWT issuance.
- **A full CRUD product catalog** for an electronics storefront.

It does **not yet** provide cart/checkout functionality, persistent storage, or authorization enforcement — these are the next steps toward the business goal of a complete online store.
