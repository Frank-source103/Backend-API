# School Result Management API

A REST API for managing students, courses, and results, built with Node.js, Express, PostgreSQL, and Prisma.

## Features
- Full CRUD for Students (`reg_no` primary key), Courses, and Results
- Automatic grade calculation from score
- Weighted GPA per student
- Input validation (Zod), pagination, consistent error responses

## Tech Stack
Node.js, Express, PostgreSQL, Prisma ORM, Zod

## Setup
1. Clone the repo and run `npm install`
2. Copy `.env.example` to `.env` and set your `DATABASE_URL`
3. Create the tables: `npx prisma migrate dev --name init`
4. Start the server: `npm run dev`

The API runs at `http://localhost:3000/api/v1`.

## Grade Scale
| Score | Grade | Points |
|-------|-------|--------|
| 70-100 | A | 5 |
| 60-69 | B | 4 |
| 50-59 | C | 3 |
| 45-49 | D | 2 |
| 0-44 | F | 0 |

GPA = sum(points x credit units) / sum(credit units)

## Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Server check |
| POST, GET | /students | Create / list (?page=&limit=) |
| GET, PUT, DELETE | /students/:reg_no | Read / update / delete |
| GET | /students/:reg_no/results | All results for a student |
| GET | /students/:reg_no/gpa | Student GPA |
| POST, GET | /courses | Create / list |
| GET, PUT, DELETE | /courses/:id | Read / update / delete |
| GET | /courses/:id/results | All results for a course |
| POST, GET | /results | Create / list |
| GET, PUT, DELETE | /results/:id | Read / update / delete |

## Sample Requests
Create a student: `POST /api/v1/students`
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

Create a course: `POST /api/v1/courses`
```json
{ "code": "CSC101", "title": "Intro to Computer Science", "credit_units": 3 }
```

Record a result: `POST /api/v1/results`
```json
{ "reg_no": "2024-001", "course_id": 1, "score": 78, "semester": "2024/2025-1" }
```

## Error Format
```json
{ "success": false, "message": "Student not found" }
```
Status codes: 400 (validation), 404 (not found), 409 (duplicate or blocked delete), 500 (server error).