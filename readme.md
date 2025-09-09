# 📚 Node Education API

This project provides APIs for managing **nodes, users, programs, courses, enrollments, and more**.  
It is designed for nodal officers, admins, faculty, and students to streamline education workflows.

---

## 🚀 Authentication & Roles

- **Nodal Officer** → Manage admins, programs, courses, enrollments  
- **Admin** → Manage programs, courses, users  
- **Faculty & Students** → Limited access (view courses, enrollments, progress, etc.)

All protected routes require a **JWT Token**:

```http
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 🔑 API Endpoints

### 1. Login
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "rajesh.kumar@example.com",
  "password": "password123"
}
```

---

### 2. Create Admin (as Nodal Officer)
```http
POST /api/auth/create-user
```

---

### 3. Get User Profile
```http
GET /api/auth/profile
```

---

### 4. Get Users
```http
GET /api/auth/users
```

---

### 5. Create Program
```http
POST /api/auth/programs
```

---

### 6. Get Programs
```http
GET /api/auth/programs
```

---

### 7. Create Course
```http
POST /api/auth/courses
```

---

### 8. Get Courses
```http
GET /api/auth/courses
```

---

### 9. Enroll Student
```http
POST /api/auth/enroll
```

---

### 10–14. (Planned / Requires DB Direct Access)

- Assign Faculty  
- Mark Attendance  
- Award Credits  
- Generate Certificates  
- Track Student Progress  

---

## 🧪 Testing Workflow

1. **Login as Nodal Officer**
   ```http
   POST /api/auth/login
   ```
2. **Create Program**
   ```http
   POST /api/auth/programs
   ```
3. **Verify Programs**
   ```http
   GET /api/auth/programs
   ```
4. **Create Course**
   ```http
   POST /api/auth/courses
   ```
5. **Verify Courses**
   ```http
   GET /api/auth/courses
   ```
6. **Enroll Student**
   ```http
   POST /api/auth/enroll
   ```
7. **Get Profile**
   ```http
   GET /api/auth/profile
   ```
8. **Get All Users**
   ```http
   GET /api/auth/users
   ```

---

## ⚡ Notes

- Use **Bearer Token** for all protected routes  
- Some features (faculty assignment, attendance, credits, certificates, progress tracking) are **future scope** and may require direct DB access or new endpoints  
- API responses include helpful messages and resource objects for quick integration  

---
