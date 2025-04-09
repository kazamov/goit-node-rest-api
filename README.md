# Contacts API

A RESTful API for managing contacts built with Express.js and TypeScript.

## Table of Contents

- [Contacts API](#contacts-api)
  - [Table of Contents](#table-of-contents)
  - [Overview](#overview)
  - [Features](#features)
  - [Technologies](#technologies)
  - [Getting Started](#getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [API Documentation](#api-documentation)
    - [Authentication Endpoints](#authentication-endpoints)
      - [Register a new user](#register-a-new-user)
      - [Login](#login)
      - [Get current user](#get-current-user)
    - [Contacts Endpoints](#contacts-endpoints)
      - [Get all contacts](#get-all-contacts)
      - [Get contact by ID](#get-contact-by-id)
      - [Add new contact](#add-new-contact)
      - [Update contact](#update-contact)
      - [Delete contact](#delete-contact)
  - [Development](#development)
    - [Available Scripts](#available-scripts)
    - [Project Structure](#project-structure)
  - [Testing](#testing)
  - [Deployment](#deployment)
  - [Contributing](#contributing)
  - [License](#license)

## Overview

The Contacts API provides a secure and efficient way to manage contact information. It features user authentication, contact CRUD operations, and email notifications.

## Features

- User registration and authentication with JWT
- Complete CRUD operations for contacts
- Email verification and notifications
- Rate limiting for API endpoints
- File uploads for contact avatars
- PostgreSQL database integration

## Technologies

- Node.js
- Express.js
- TypeScript
- Sequelize ORM
- PostgreSQL
- JWT Authentication
- React Email for email templates
- Multer for file uploads
- Docker for development and testing environments

## Getting Started

### Prerequisites

- Node.js (v22.14.0)
- Docker and Docker Compose (for database)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/kazamov/goit-node-rest-api.git
   cd goit-node-rest-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (see next section)

4. Start the development server:
   ```bash
   npm run dev
   ```

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
PORT=3000
API_DOMAIN=http://localhost:3000

# Database
DB_USERNAME=testuser
DB_PASSWORD=testpassword
DB_HOST=localhost
DB_NAME=testdb
DB_PORT=5432
DB_ENABLE_SSL=false

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Email
SMTP_EMAIL=admin@test.com
SMTP_PASSWORD=
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_SECURE=false
```

## Database Setup

The application uses PostgreSQL as its database. You can start a development database using Docker:

```bash
npm run services:start
```

## API Documentation

### Authentication Endpoints

#### Register a new user
```
POST /api/users/register
```
**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

#### Login
```
POST /api/users/login
```
**Request body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### Get current user
```
GET /api/users/current
```
**Headers:**
```
Authorization: Bearer <token>
```

### Contacts Endpoints

#### Get all contacts
```
GET /api/contacts
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Get contact by ID
```
GET /api/contacts/:id
```
**Headers:**
```
Authorization: Bearer <token>
```

#### Add new contact
```
POST /api/contacts
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "1234567890"
}
```

#### Update contact
```
PUT /api/contacts/:id
```
**Headers:**
```
Authorization: Bearer <token>
```
**Request body:**
```json
{
  "name": "John Updated",
  "email": "updated@example.com",
  "phone": "0987654321"
}
```

#### Delete contact
```
DELETE /api/contacts/:id
```
**Headers:**
```
Authorization: Bearer <token>
```

## Development

### Available Scripts

- `npm run build` - Build the project
- `npm run start` - Start the production server
- `npm run dev` - Start the development server with hot-reload
- `npm run type-check` - Check TypeScript types
- `npm run format` - Format code with Prettier
- `npm run lint` - Lint and fix code with ESLint
- `npm run email:dev` - Start email preview server
- `npm run test` - Run tests
- `npm run coverage` - Run tests with coverage
- `npm run e2e` - Run end-to-end tests with Playwright
- `npm run services:start` - Run services in Docker
- `npm run services:stop` - Stop Docker services

### Project Structure

```
src/
├── app.ts                  # Application entry point
├── config/                 # Configuration files
├── controllers/            # Route controllers
├── emails/                 # Email templates
├── middleware/             # Express middleware
├── models/                 # Database models
├── routes/                 # Express routes
├── services/               # Business logic
├── types/                  # TypeScript type definitions
└── utils/                  # Utility functions
```

## Testing

The project uses Vitest for unit and integration tests, and Playwright for end-to-end testing.

```bash
# Run all tests
npm run test

# Run tests with coverage
npm run coverage

# Run end-to-end tests
npm run e2e
```

## Deployment

The application is ready for deployment on any Node.js hosting platform.

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the production server:
   ```bash
   npm run start
   ```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the terms specified in the LICENSE file.
