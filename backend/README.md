# Lost & Found - Microservices Backend Architecture

This directory contains the microservices backend for the **Lost & Found** platform. It follows an industry-standard, scalable microservices architecture built with **JavaScript (Node.js)**.

---

## 📁 Repository Structure

```
backend/
├── gateway/                # API Gateway (Routing, Rate Limiting, Proxying)
├── auth-service/           # Authentication & Token Management Service
├── user-service/           # User Profiles & Account Management Service
├── item-service/           # Lost & Found Items Management Service
├── claim-service/          # Item Claims & Verification Service
├── shared/                 # Reusable cross-service utilities & middleware
│   ├── config/             # Shared configurations & constants
│   ├── middleware/         # Shared express middlewares (error handling, auth check, etc.)
│   └── utils/              # Shared helper functions (logger, response formats, etc.)
└── README.md               # Backend documentation
```

---

## 🚀 Services Overview

### 1. API Gateway (`gateway/`)
- Entry point for all client requests.
- Handles reverse proxying, request routing to specific services, rate limiting, and global request validation.

### 2. Authentication Service (`auth-service/`)
- Manages user registration, login, JWT token issuance, token verification, and password resets.

### 3. User Service (`user-service/`)
- Manages user profiles, contact information, role assignments, and user activity history.

### 4. Item Service (`item-service/`)
- Manages listings for lost and found items, categorization, image metadata, location mapping, and status tracking (Active, Claimed, Resolved).

### 5. Claim Service (`claim-service/`)
- Handles claim requests, ownership verification workflows, proof of ownership submissions, and status updates between item owners and finders.

### 6. Shared Module (`shared/`)
- Contains cross-cutting concerns to adhere to DRY (Don't Repeat Yourself) principles across all microservices without tight coupling.

---

## 🛠 Service Internal Structure

Each microservice adopts a layer-based design:

```
<service-name>/
├── config/             # Service-specific configuration (Database, Environment, Service ports)
├── controllers/        # Request handlers & HTTP responses
├── middleware/         # Service-level middlewares (Validation, specific auth checks)
├── models/             # Data models & schemas
├── routes/             # API Endpoint route declarations
├── services/           # Core business logic & external integrations
├── utils/              # Service specific utility functions
├── src/
│   ├── app.js          # App instance configuration (Express app, middleware mounting)
│   └── server.js       # HTTP Server entry point (Port listener, database connection startup)
├── .env.example        # Environment variable template
├── .gitignore          # Ignored files for version control
└── package.json        # Service dependencies and npm scripts
```

---

## ⚙ Environment Setup

Each service maintains its own isolated `.env` configuration. Refer to `.env.example` inside each service directory:

```env
PORT=
MONGO_URI=
JWT_SECRET=
```

---

## 🚦 Getting Started

To initialize a service for development:

```bash
cd <service-name>
npm install
npm run dev
```
