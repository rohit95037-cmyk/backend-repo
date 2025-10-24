# Assignment Workflow Portal - Backend API

RESTful API built with Node.js and Express.js for the Assignment Workflow Portal.

## Features

- ✅ JWT Authentication
- ✅ Role-based Access Control (Teacher/Student)
- ✅ Assignment Management (CRUD)
- ✅ Submission Management
- ✅ State Transitions (Draft → Published → Completed)

## Tech Stack

- Node.js
- Express.js
- JSON Web Tokens (JWT)
- Bcrypt.js (Password Hashing)
- CORS
- Dotenv

## Installation

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the backend directory:

```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
```

4. Start the server:

```bash
# Development mode with nodemon
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Authentication

#### POST /api/auth/login

Login with email and password, returns JWT token and user info.

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

Register a new user (optional).

#### GET /api/auth/me

Get current user information (requires authentication).

### Assignments

#### GET /api/assignments

Get all assignments (role-based filtering).

- Teachers: See all assignments
- Students: See only published assignments

**Headers:**

```
Authorization: Bearer <token>
```

#### GET /api/assignments/:id

Get single assignment by ID.

#### POST /api/assignments

Create new assignment (Teachers only).

**Request Body:**

```json
{
  "title": "React Fundamentals",
  "description": "Complete the React basics tutorial",
  "dueDate": "2025-11-01"
}
```

#### PUT /api/assignments/:id

Update assignment (Teachers only, draft only).

#### PATCH /api/assignments/:id/status

Change assignment status (Teachers only).

**Request Body:**

```json
{
  "status": "published"
}
```

**Valid Transitions:**

- draft → published
- published → completed

#### DELETE /api/assignments/:id

Delete assignment (Teachers only, draft only).

### Submissions

#### GET /api/submissions

Get submissions (role-based).

- Teachers: See all submissions
- Students: See only their own submissions

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
  "submittedAnswer": "My answer text...",
  "submittedFile": "optional-filename.pdf"
}
```

#### PATCH /api/submissions/:id/review

Mark submission as reviewed (Teachers only).

## Default Users

### Teacher Account

- Email: `teacher@test.com`
- Password: `teacher123`
- Role: teacher

### Student Account

- Email: `student@test.com`
- Password: `student123`
- Role: student

## Project Structure

```
backend/
├── middleware/
│   └── auth.js              # Authentication middleware
├── models/
│   └── data.js              # In-memory database
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── assignments.js       # Assignment routes
│   └── submissions.js       # Submission routes
├── .env.example             # Environment variables template
├── package.json             # Dependencies
├── server.js                # Express server setup
└── README.md                # This file
```

## Error Handling

All errors return a JSON response with an `error` field:

```json
{
  "error": "Error message here"
}
```

Common HTTP status codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Server Error

## Security

- Passwords are hashed using bcryptjs
- JWT tokens expire after 24 hours
- Role-based access control on all protected routes
- CORS enabled for frontend communication

## Notes

- This implementation uses an in-memory database for simplicity
- For production, replace with MongoDB/PostgreSQL
- Change JWT_SECRET in production
- Add proper error logging
- Implement rate limiting
- Add input validation middleware

## License

ISC
