# School Result Management API

A REST API for managing students, courses, and academic results. It stores records in PostgreSQL, calculates grades and GPA on the server, validates every request, and protects write operations with lecturer login.

**Live API:** https://backend-api-ghnt.onrender.com/api/v1/health
**Live front end:** https://srm-frontend2.vercel.app

> The API is hosted on Render's free tier, which sleeps after about 15 minutes of inactivity. The first request after idle time can take 30 to 60 seconds.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture](#architecture)
5. [Project Structure](#project-structure)
6. [Database Schema](#database-schema)
7. [Grading and GPA](#grading-and-gpa)
8. [API Reference](#api-reference)
9. [Authentication](#authentication)
10. [Validation and Error Handling](#validation-and-error-handling)
11. [Getting Started](#getting-started)
12. [Environment Variables](#environment-variables)
13. [Deployment](#deployment)
14. [Testing the API](#testing-the-api)
15. [Design Decisions](#design-decisions)
16. [Troubleshooting](#troubleshooting)
17. [Roadmap](#roadmap)

---

## Overview

Schools need a reliable way to record who took which course and what they scored. This API provides that as a backend service that any client can consume: a web front end, a mobile app, or a script.

It manages three resources:

- **Students**, identified by a unique `reg_no` (registration number)
- **Courses**, the institution's course offerings
- **Results**, a student's score in a course for a given semester. A student can have many results across different courses.

A companion React front end (Vite, deployed on Vercel) consumes this API and adds pagination, create/edit/delete forms, Excel upload of student and result data, selectable themes, and a lecturer login screen.

## Features

- Full CRUD (create, read, update, delete) for students, courses, and results
- `reg_no` as the primary key for students
- Grades are calculated by the server from the score, never accepted from the client
- Credit-unit-weighted GPA per student
- Endpoints for a student's results, a course's results, and a student's GPA
- Pagination on every list endpoint (`?page=&limit=`)
- Input validation with clear, field-level error messages
- Duplicate protection (no duplicate students, course codes, or results)
- Delete protection: records linked to other records cannot be deleted by accident
- Consistent JSON response and error format with correct HTTP status codes
- Lecturer login with JWT; write operations are restricted to logged-in lecturers
- CORS restricted to the deployed front end

## Tech Stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js |
| Framework | Express 4 |
| Database | PostgreSQL (hosted on Neon) |
| ORM | Prisma 5 |
| Validation | Zod |
| Auth | JSON Web Tokens (JWT) |
| Config | dotenv |
| Dev tooling | nodemon, Thunder Client |
| Hosting | Render (API), Vercel (front end), Neon (database) |

## Architecture

The code follows a layered pattern. Each layer has one job, so changes stay local and the code stays easy to read.

```
Request
   |
   v
Route          maps URL + method to a controller
   |
   v
Validator      checks the request body (Zod)
   |
   v
Controller     handles HTTP: reads the request, sends the response
   |
   v
Service        business logic and database access (Prisma)
   |
   v
PostgreSQL
```

Errors from any layer flow to a single error-handling middleware, which turns them into clean JSON responses.

## Project Structure

```
srm-api/
├── prisma/
│   ├── schema.prisma          # data models and relations
│   └── migrations/            # recorded database changes
├── src/
│   ├── routes/                # URL -> controller mapping
│   ├── controllers/           # HTTP request/response handling
│   ├── services/              # business logic and database queries
│   ├── validators/            # Zod schemas for request bodies
│   ├── middleware/            # validation, 404, error handling, JWT auth
│   ├── utils/
│   │   ├── prisma.js          # shared Prisma client
│   │   ├── AppError.js        # error class carrying an HTTP status
│   │   ├── asyncHandler.js    # forwards async errors to the error handler
│   │   ├── parseId.js         # safely converts URL ids to numbers
│   │   └── grade.js           # score -> grade and grade points
│   ├── app.js                 # builds the Express app
│   └── server.js              # starts the server
├── .env.example               # template for environment variables
├── .gitignore
├── package.json
└── README.md
```

`app.js` and `server.js` are separate on purpose: `app.js` defines the app, `server.js` starts listening. This keeps the app easy to test.

## Database Schema

Three tables, connected by foreign keys.

```
Student (students)            Course (courses)             Result (results)
------------------            ----------------             ----------------
reg_no   PK                   id            PK             id         PK
first_name                    code          UNIQUE         reg_no     FK -> Student
last_name                     title                        course_id  FK -> Course
email    UNIQUE               credit_units                 score
date_of_birth                 created_at                   grade
department                                                 semester
created_at                                                 created_at
```

**Relationships**

- One student has many results
- One course has many results
- A result belongs to exactly one student and one course

**Constraints**

- `students.reg_no` is the primary key
- `students.email` and `courses.code` are unique
- (`reg_no`, `course_id`, `semester`) is unique together, so a student cannot have two results for the same course in the same semester
- Foreign keys use `onDelete: Restrict`, so a student or course that still has results cannot be deleted

## Grading and GPA

Grades are derived from the score on the server.

| Score | Grade | Points |
|-------|-------|--------|
| 70 - 100 | A | 5 |
| 60 - 69 | B | 4 |
| 50 - 59 | C | 3 |
| 45 - 49 | D | 2 |
| 0 - 44 | F | 0 |

GPA is weighted by course credit units:

```
GPA = sum(grade points x credit units) / sum(credit units)
```

**Example:** CSC101 (3 units, grade C = 3 points) and MTH101 (2 units, grade A = 5 points):

```
(3 x 3 + 5 x 2) / (3 + 2) = 19 / 5 = 3.8
```

The GPA is cumulative across all of a student's results and rounded to two decimal places. A student with no results has a `null` GPA.

## API Reference

**Base URL:** `/api/v1`
(Live: `https://backend-api-ghnt.onrender.com/api/v1`)

### Health

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Confirms the server is running |

### Students

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/students` | Create a student |
| GET | `/students` | List students (paginated) |
| GET | `/students/:reg_no` | Get one student |
| PUT | `/students/:reg_no` | Update a student (`reg_no` cannot be changed) |
| DELETE | `/students/:reg_no` | Delete a student |
| GET | `/students/:reg_no/results` | All results for a student, with course info |
| GET | `/students/:reg_no/gpa` | The student's cumulative GPA |

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/courses` | Create a course |
| GET | `/courses` | List courses (paginated) |
| GET | `/courses/:id` | Get one course |
| PUT | `/courses/:id` | Update a course |
| DELETE | `/courses/:id` | Delete a course |
| GET | `/courses/:id/results` | All results for a course, highest score first |

### Results

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/results` | Record a result (grade is calculated automatically) |
| GET | `/results` | List results (paginated) |
| GET | `/results/:id` | Get one result |
| PUT | `/results/:id` | Update score or semester (grade is recalculated) |
| DELETE | `/results/:id` | Delete a result |

### Pagination

List endpoints accept `?page=` (default 1) and `?limit=` (default 10, maximum 100):

```
GET /api/v1/students?page=2&limit=5
```

```json
{
  "success": true,
  "students": [],
  "total": 12,
  "page": 2,
  "limit": 5,
  "totalPages": 3
}
```

### Example requests

**Create a student** `POST /students`

```json
{
  "reg_no": "2024-001",
  "first_name": "Ada",
  "last_name": "Obi",
  "email": "ada@example.com",
  "date_of_birth": "2003-05-14",
  "department": "Computer Science"
}
```

**Create a course** `POST /courses`

```json
{
  "code": "CSC101",
  "title": "Intro to Computer Science",
  "credit_units": 3
}
```

**Record a result** `POST /results`

```json
{
  "reg_no": "2024-001",
  "course_id": 1,
  "score": 78,
  "semester": "2024/2025-1"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "reg_no": "2024-001",
    "course_id": 1,
    "score": 78,
    "grade": "A",
    "semester": "2024/2025-1",
    "created_at": "2026-10-27T16:37:01.457Z",
    "student": { "reg_no": "2024-001", "first_name": "Ada", "last_name": "Obi" },
    "course": { "id": 1, "code": "CSC101", "title": "Intro to Computer Science", "credit_units": 3 }
  }
}
```

**Update a score** `PUT /results/1` with `{ "score": 55 }` returns the same result with `"grade": "C"`. Only the score was sent. The server recalculated the grade.

## Authentication

Viewing data is public. Changing data (create, update, delete) requires a lecturer login.

1. The lecturer logs in with their credentials and receives a **JWT** (JSON Web Token).
2. The client sends the token with each protected request in the `Authorization` header:

```
Authorization: Bearer <token>
```

3. Requests without a valid token are rejected.

Lecturer credentials and the token signing secret are stored as environment variables on the server, never in the code or the repository.

## Validation and Error Handling

Every request body is validated with Zod before it reaches the business logic. Invalid input returns a `400` with a message for each bad field:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email" }
  ]
}
```

All other errors use the same shape:

```json
{ "success": false, "message": "Student not found" }
```

| Status | Meaning | Example |
|--------|---------|---------|
| 200 | OK | Successful read, update, or delete |
| 201 | Created | New student, course, or result |
| 400 | Bad request | Failed validation, malformed JSON, non-numeric id |
| 401 / 403 | Not authorised | Missing or invalid token on a protected route |
| 404 | Not found | Unknown student, course, result, or route |
| 409 | Conflict | Duplicate `reg_no`, email, course code, or result; deleting a record that still has linked results |
| 500 | Server error | Unexpected bug (details are logged, never sent to the client) |

Database errors from Prisma (such as `P2002` for duplicates and `P2003` for blocked deletes) are translated into the friendly `409` responses above.

## Getting Started

### Prerequisites

- Node.js 18 or later
- A PostgreSQL database (a free [Neon](https://neon.tech) project works well)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Frank-source103/Backend-API.git
cd Backend-API

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env
# then edit .env and fill in your values

# 4. Create the database tables
npx prisma migrate dev --name init

# 5. Start the development server
npm run dev
```

The API runs at `http://localhost:3000/api/v1`. Open `/api/v1/health` to confirm.

### Scripts

| Command | What it does |
|---------|--------------|
| `npm run dev` | Starts the server with nodemon (restarts on file changes) |
| `npm start` | Starts the server normally (used in production) |

## Environment Variables

Create a `.env` file in the project root. It is listed in `.gitignore` and must never be committed.

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Port to listen on (defaults to 3000; Render sets this automatically) |
| JWT secret and lecturer credentials | Used for login and token signing; see `.env.example` for the exact names |

Example `.env`:

```
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
PORT=3000
```

> **Neon tip:** if the connection fails with "Can't reach database server", remove `&channel_binding=require` from the end of the connection string.

## Deployment

| Part | Service |
|------|---------|
| Database | Neon (PostgreSQL) |
| API | Render (Web Service) |
| Front end | Vercel |

**Render settings**

- **Build command:** `npm install && npx prisma generate && npx prisma migrate deploy`
- **Start command:** `npm start`
- **Environment variables:** set `DATABASE_URL` (and the auth variables) in the Render dashboard

`prisma` is listed under `dependencies`, not `devDependencies`, because Render installs only production dependencies during the build and the build command needs the Prisma CLI.

Pushing to the `main` branch on GitHub triggers an automatic redeploy.

**Schema changes:** edit `prisma/schema.prisma`, run `npx prisma migrate dev` locally, and commit the new migration folder. The next Render build applies it with `prisma migrate deploy`.

**CORS:** the API only accepts browser requests from the deployed front end's origin.

## Testing the API

Use a request tool such as [Thunder Client](https://www.thunderclient.com/) (VS Code extension) or Postman. Browsers can only send GET requests from the address bar.

A good manual test sequence:

1. `POST /students`, `POST /courses`, then `POST /results`: expect 201 each, and a calculated `grade`
2. `GET /students/:reg_no/gpa`: expect the weighted GPA
3. `PUT /results/:id` with a new score: expect the grade to change
4. Try to break it. Each of these should fail on purpose:

| Request | Expected |
|---------|----------|
| Create the same student twice | 409 |
| Create a duplicate result (same student, course, semester) | 409 |
| Create a student with `"email": "nope"` | 400 |
| Create a result with `"score": 150` | 400 |
| `GET /students/9999` | 404 |
| `GET /courses/abc` | 400 |
| Delete a student who still has results | 409 |

## Design Decisions

**Why the server calculates grades.** If clients sent both `score` and `grade`, they could disagree. The server derives the grade from the score on every create and update, so the data stays consistent.

**Why a service layer.** Controllers only deal with HTTP; services hold the logic. Services call each other (for example, creating a result checks that the student and course exist through the student and course services), which avoids duplicated queries.

**Why `Restrict` on deletes.** Deleting a student should not silently erase their academic record. The database blocks it, and the API explains why with a 409.

**Why a unique constraint on (student, course, semester).** It prevents accidental duplicate results while still allowing a retake in a later semester.

**Why Zod at the edge.** Bad data is rejected before it touches the database, with specific per-field messages.

**Why one central error handler.** Every error leaves the API in the same shape, and unexpected errors never leak internal details.

**Why Neon, Render, and Vercel.** Each has a free tier, deploys directly from GitHub, and separates the database, API, and front end cleanly.

## Troubleshooting

| Problem | Likely cause and fix |
|---------|----------------------|
| `Route not found: GET /` | Expected. All routes start with `/api/v1`. |
| First request is very slow | Render's free tier was asleep, or Neon's database was waking up. Wait and retry. |
| `Can't reach database server` | Check `DATABASE_URL`, remove `&channel_binding=require`, and confirm your internet connection. |
| `@prisma/client did not initialize yet` | Run `npx prisma generate`. |
| Table does not exist | Run `npx prisma migrate dev` (local) or check the Render build logs for `migrate deploy`. |
| Changes to `.env` have no effect | Nodemon does not watch `.env`. Stop the server (Ctrl+C) and run `npm run dev` again. |
| Render build fails with "Exited with status 1" | Make sure `prisma` is in `dependencies` in `package.json`. |
| Browser blocks requests from the front end | The front end's origin must match the one allowed by the API's CORS setting. |
| `EADDRINUSE` | Port 3000 is taken. Change `PORT` in `.env`. |

## Roadmap

- Student accounts, so students can log in and view only their own results
- A student result lookup page on the front end
- Automated tests for the services and routes
- Rate limiting and security headers
- API documentation with Swagger / OpenAPI
- Filtering and search on list endpoints (by department, semester, grade)

---

Built as a bootcamp capstone project (Backend API track): Node.js, Express, PostgreSQL, Prisma.
