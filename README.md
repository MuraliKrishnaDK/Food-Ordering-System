# FoodDoor — Online Food Ordering System

A full-stack web application that allows customers to browse a food menu, manage a cart, and place orders — while also providing a merchant-facing portal for restaurant owners to manage their menu items. Built with **Angular 8** on the frontend and **Spring Boot 2** on the backend, backed by a **PostgreSQL** database.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Database Setup](#database-setup)
- [Backend Setup](#backend-setup)
- [Frontend Setup](#frontend-setup)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)

---

## Features

### Customer
- User registration and login with AES-encrypted passwords
- Browse full food menu with item images and prices
- Add items to cart and adjust quantities
- Proceed to checkout and place orders
- View order success confirmation
- Contact Us / Help & Support page
- Account settings management

### Merchant
- Dedicated merchant login and dashboard
- Add new food items to the menu (via image upload or image URL)
- Manage existing menu items
- View and manage restaurant profile

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | Angular 8, TypeScript, Bootstrap 4, Font Awesome |
| Backend    | Spring Boot 2.1.6, Spring Data JPA, Hibernate |
| Database   | PostgreSQL 13+                          |
| Security   | AES Encryption (custom `StrongAES` utility) |
| Build Tool | Maven (backend), Angular CLI (frontend) |

---

## Project Structure

```
Food Ordering System/
├── database sql file/
│   └── myusers.sql              # PostgreSQL script to bootstrap the database
├── xwiggy-app/                  # Angular 8 frontend
│   └── src/
│       └── app/
│           ├── home/            # Landing / home page
│           ├── login/           # Customer & merchant login
│           ├── register/        # New user registration
│           ├── menu/            # Food menu (customer view)
│           ├── checkout/        # Cart & checkout
│           ├── success/         # Order confirmation
│           ├── welcome/         # Customer profile/dashboard
│           ├── merchant-welcome/ # Merchant dashboard
│           ├── merchant-menu/   # Merchant menu management
│           ├── add-item/        # Add new food item (merchant)
│           ├── settings/        # Account settings
│           └── contact-us/      # Help & support
└── xwiggy-back/                 # Spring Boot backend
    └── src/main/java/com/xwiggy/food/
        ├── controller/          # REST controllers
        ├── dao/                 # DAO interfaces & implementations
        ├── model/               # JPA entity models
        └── utility/             # AES encryption utility
```

---

## Prerequisites

- **Java 11** (or Java 17+)
- **Maven 3.6+**
- **Node.js 16+** and **npm 8+**
- **Angular CLI 8** — `npm install -g @angular/cli@8`
- **PostgreSQL 13+**

---

## Database Setup

1. Create a PostgreSQL database named `myusers`:
   ```sql
   CREATE DATABASE myusers;
   ```

2. Import the provided SQL script:
   ```bash
   psql -U postgres -d myusers -f "database sql file/myusers.sql"
   ```

3. The script creates and seeds the following tables:
   - `app_user` — registered users (customers & merchants)
   - `food` — menu items with name, price, image, and category
   - `cart` — cart and order data
   - `contact` — contact/support messages

---

## Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd xwiggy-back
   ```

2. Update database credentials in `src/main/resources/application.properties` if needed:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/myusers
   spring.datasource.username=postgres
   spring.datasource.password=
   ```

3. Build and run:
   ```bash
   ./mvnw spring-boot:run
   ```

The backend starts on **http://localhost:8080**.

---

## Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd xwiggy-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   ng serve
   ```

The Angular app is served at **http://localhost:4200**.

---

## API Endpoints

| Method | Endpoint          | Description                              |
|--------|-------------------|------------------------------------------|
| POST   | `/register`       | Register a new user                      |
| POST   | `/checkUserName`  | Check if a username is already taken     |
| POST   | `/login`          | Authenticate a user                      |
| GET    | `/menu`           | Fetch all food menu items                |
| POST   | `/cart`           | Save cart and calculate total            |
| POST   | `/addToCart`      | Update item quantities in cart           |
| POST   | `/addNewItem`     | Add new food item with image upload      |
| POST   | `/addNewItemUrl`  | Add new food item with image URL         |
| POST   | `/checkItemId`    | Check if a food item ID is already taken |
| GET    | `/changeDB`       | Rotate/update database records           |
