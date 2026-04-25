# Waste Management API

Welcome to the Waste Management API. This backend service provides a platform for farmers to post waste for collection and for collectors to purchase it. It includes features for authentication, waste management, and a transaction engine with gamification elements.

This document provides a complete guide for frontend developers to integrate with the API.

## Getting Started

### Prerequisites

- Node.js
- npm
- A running PostgreSQL database

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repo-url>
    cd <your-repo-directory>
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and populate it with the necessary values (see the `env.example` file).

4.  **Run database migrations:**
    ```bash
    npx prisma migrate dev
    ```

5.  **Start the server:**
    ```bash
    npm run dev
    ```
    The API will be available at `http://localhost:3000`.

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

### Authentication (`/api/v1/auth`)

These endpoints handle user registration and login.

#### 1. Register User

-   **Endpoint:** `POST /auth/register`
-   **Description:** Creates a new user account.
-   **Authentication:** None required.
-   **Request Body:**
    ```json
    {
      "name": "John Doe",
      "email": "john.doe@example.com",
      "password": "yourstrongpassword",
      "role": "FARMER" // Or COLLECTOR, ADMIN
    }
    ```

#### 2. Login User

-   **Endpoint:** `POST /auth/login`
-   **Description:** Authenticates a user and returns a JWT token.
-   **Authentication:** None required.
-   **Request Body:**
    ```json
    {
      "email": "john.doe@example.com",
      "password": "yourstrongpassword"
    }
    ```
-   **Response:**
    ```json
    {
        "token": "ey..."
    }
    ```

### Waste Management (`/api/v1/waste`)

Endpoints for managing waste posts and categories. All routes here require authentication.

**Header Required:** `Authorization: Bearer <token>`

#### 1. Create a New Waste Post

-   **Endpoint:** `POST /waste`
-   **Description:** Creates a new waste listing. **(FARMER only)**
-   **Request Body:**
    ```json
    {
        "title": "Organic Banana Peels",
        "description": "Fresh peels from our latest harvest.",
        "weight": 15.5, // in kg
        "categoryId": "cl...", // ID from GET /waste/categories
        "imageUrl": "https://example.com/image.png" // Optional
    }
    ```

#### 2. Get All Available Waste Posts

-   **Endpoint:** `GET /waste`
-   **Description:** Retrieves all waste posts with the status `AVAILABLE`.

#### 3. Get All Waste Categories

-   **Endpoint:** `GET /waste/categories`
-   **Description:** Retrieves a list of all waste categories.

### Transactions (`/api/v1/transactions`)

Endpoints for handling the waste transaction lifecycle. All routes here require authentication.

**Header Required:** `Authorization: Bearer <token>`

#### 1. Create a Transaction

-   **Endpoint:** `POST /transactions`
-   **Description:** Initiates a transaction for a waste post. This changes the waste status to `BOOKED`. **(COLLECTOR only)**
-   **Request Body:**
    ```json
    {
        "wastePostId": "cl..."
    }
    ```

#### 2. Complete a Transaction

-   **Endpoint:** `PATCH /transactions/:id/complete`
-   **Description:** Marks a `PENDING` transaction as `COMPLETED`. This finalizes the process, changes the waste status to `SOLD`, and awards points to the farmer. **(COLLECTOR or ADMIN only)**
-   **`id`** in the URL is the `transactionId`.

---

## Core Logic Explained

### Cuan Calculator (Price Calculation)

The pricing for waste is dynamic and calculated at the time a transaction is created.

-   **Formula:** `Final Price = Waste Weight (kg) × Base Price per Kg`
-   **`Waste Weight`**: Comes from the `WastePost` record.
-   **`Base Price per Kg`**: Comes from the `WasteCategory` associated with the `WastePost`.
-   This `finalPrice` is calculated and stored in the `Transaction` record when a `COLLECTOR` initiates the purchase.

### Gamification (Point System)

The platform rewards farmers for contributing to the ecosystem.

-   **Trigger:** A transaction is successfully marked as `COMPLETED` via the `PATCH /transactions/:id/complete` endpoint.
-   **Reward:** The `FARMER` who originally created the `WastePost` receives **+10 points**.
-   **Audit:** A `PointLog` entry is created for each point reward, creating an auditable history of points awarded.
-   The farmer's total points are stored in the `points` field on their `User` record.
