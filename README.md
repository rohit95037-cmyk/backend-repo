# Assignment Management System - Backend API

A robust RESTful API built with Node.js and Express.js for managing assignments between teachers and students. Features JWT authentication, role-based access control, and comprehensive assignment/submission management.

## Features

- ✅ **JWT Authentication** - Secure token-based authentication
- ✅ **Role-based Access Control** - Separate permissions for Teachers and Students
- ✅ **Assignment Management** - Full CRUD operations for assignments
- ✅ **Submission Management** - Handle student submissions and reviews
- ✅ **State Transitions** - Draft → Published → Completed workflow
- ✅ **CORS Support** - Cross-origin resource sharing enabled
- ✅ **Error Handling** - Comprehensive error handling middleware

## Tech Stack

- **Node.js** - JavaScript runtime environment
- **Express.js** - Web application framework
- **JSON Web Tokens (JWT)** - Authentication and authorization
- **Bcrypt.js** - Password hashing and security
- **CORS** - Cross-origin resource sharing
- **Dotenv** - Environment variable management
- **Nodemon** - Development server with auto-restart

## Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (version 14.0 or higher)
- **npm** or **yarn** package manager
- **Git** (for version control)

## Steps to Set Up and Run Locally

### 1. Clone the Repository

```bash
git clone https://github.com/rohit95037-cmyk/backend-repo.git
cd backend-repo
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

**Important**: Change the `JWT_SECRET` to a secure random string in production!

### 4. Start the Server

```bash
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000` (or the port specified in your `.env` file).

### 5. Verify Installation

Test the server by visiting the health check endpoint:

```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "OK",
  "message": "Server is running"
}
```

## Available Scripts

- `npm start` - Start the server in production mode
- `npm run dev` - Start the server in development mode with nodemon
- `npm install` - Install all dependencies

## API Endpoints

### Authentication Endpoints

#### POST /api/auth/login
Login with email and password to receive JWT token.

**Request Body:**
```json
{
  "email": "teacher@test.com",
  "password": "teacher123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "teacher@test.com",
    "role": "teacher",
    "name": "Teacher User"
  }
}
```

#### POST /api/auth/register
Register a new user account.

#### GET /api/auth/me
Get current user information (requires authentication).

### Assignment Endpoints

#### GET /api/assignments
Get all assignments (role-based filtering):
- **Teachers**: See all assignments
- **Students**: See only published assignments

**Headers:**
```
Authorization: Bearer <your_jwt_token>
```

#### GET /api/assignments/:id
Get a specific assignment by ID.

#### POST /api/assignments
Create a new assignment (Teachers only).

**Request Body:**
```json
{
  "title": "React Fundamentals Assignment",
  "description": "Complete the React basics tutorial and submit your code",
  "dueDate": "2025-11-01"
}
```

#### PUT /api/assignments/:id
Update an assignment (Teachers only, draft status only).

#### PATCH /api/assignments/:id/status
Change assignment status (Teachers only).

**Request Body:**
```json
{
  "status": "published"
}
```

**Valid Status Transitions:**
- `draft` → `published`
- `published` → `completed`

#### DELETE /api/assignments/:id
Delete an assignment (Teachers only, draft status only).

### Submission Endpoints

#### GET /api/submissions
Get submissions (role-based):
- **Teachers**: See all submissions
- **Students**: See only their own submissions

#### GET /api/submissions/assignment/:assignmentId
Get all submissions for a specific assignment (Teachers only).

#### GET /api/submissions/my/:assignmentId
Get student's own submission for an assignment (Students only).

#### POST /api/submissions
Submit an assignment (Students only).

**Request Body:**
```json
{
  "assignmentId": 1,
  "submittedAnswer": "My detailed answer to the assignment...",
  "submittedFile": "optional-filename.pdf"
}
```

#### PATCH /api/submissions/:id/review
Mark submission as reviewed (Teachers only).

## Default Test Accounts

### Teacher Account
- **Email**: `teacher@test.com`
- **Password**: `teacher123`
- **Role**: `teacher`
- **Permissions**: Create, read, update, delete assignments; view all submissions

### Student Account
- **Email**: `student@test.com`
- **Password**: `student123`
- **Role**: `student`
- **Permissions**: View published assignments; submit assignments; view own submissions

## Project Structure

```
backend/
├── middleware/
│   └── auth.js              # JWT authentication middleware
├── models/
│   └── data.js              # In-memory database and data models
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── assignments.js       # Assignment CRUD routes
│   └── submissions.js       # Submission management routes
├── .env                     # Environment variables (create this)
├── package.json             # Dependencies and scripts
├── server.js                # Express server configuration
└── README.md                # This documentation
```

## Error Handling

All API endpoints return consistent error responses:

```json
{
  "error": "Descriptive error message"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad Request (invalid input)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **500**: Internal Server Error

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **JWT Tokens**: Secure token-based authentication with 24-hour expiration
- **Role-based Access**: Different permissions for teachers and students
- **CORS Protection**: Configured for secure cross-origin requests
- **Input Validation**: Basic validation on all endpoints

## Additional Notes and Assumptions

### Database Implementation
- **Current**: Uses in-memory storage for simplicity and demonstration
- **Production**: Should be replaced with MongoDB, PostgreSQL, or similar database
- **Data Persistence**: Data is lost when server restarts (development only)

### Authentication Flow
- JWT tokens are required for all protected routes
- Tokens expire after 24 hours and must be refreshed
- User roles are embedded in the JWT token for authorization

### Assignment Workflow
- Assignments start in `draft` status
- Teachers can publish drafts to make them visible to students
- Published assignments can be marked as `completed`
- Students can only submit to published assignments

### Frontend Integration
- API is designed to work with React frontend
- CORS is configured for `http://localhost:5173` (Vite default)
- All responses are in JSON format
- Error handling is consistent across all endpoints

### Development Assumptions
- Server runs on port 5000 by default
- Frontend runs on port 5173 (Vite default)
- JWT secret should be changed in production
- Environment variables are loaded from `.env` file

### Production Considerations
- Replace in-memory database with persistent storage
- Implement proper logging and monitoring
- Add rate limiting to prevent abuse
- Use environment-specific JWT secrets
- Implement proper input validation middleware
- Add API documentation with Swagger/OpenAPI
- Set up proper error logging and monitoring

## Environment Variables

Create a `.env` file with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Database Configuration (for future use)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=assignment_portal
# DB_USER=your_db_user
# DB_PASSWORD=your_db_password
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is part of an assignment management system. Please refer to your institution's guidelines for usage and distribution.

## Contact

For questions or support, please contact the development team or create an issue in the repository.

---

**Note**: This backend API is designed to work with the corresponding React frontend. Make sure both frontend and backend are running for full functionality. The API provides all necessary endpoints for a complete assignment management system with teacher and student workflows.