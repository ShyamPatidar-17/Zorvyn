<h1 align="center">💰 Financial Management System (RBAC)</h1>

<p align="center">
  A comprehensive <b>MERN stack</b> application for financial tracking with secure <b>Role-Based Access Control (RBAC)</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/MERN-Stack-blue" />
  <img src="https://img.shields.io/badge/Auth-JWT-green" />
  <img src="https://img.shields.io/badge/UI-TailwindCSS-38B2AC" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

---

## 📌 Table of Contents

* [🚀 Quick Start](#-quick-start)
* [👥 User Roles & Permissions](#-user-roles--permissions)
* [📦 Key Modules](#-key-modules)
* [🛠 Tech Stack](#-tech-stack)
* [⚙️ Configuration](#️-configuration)
* [⚖️ Assumptions & Tradeoffs](#️-assumptions--tradeoffs)
* [📄 License](#-license)

---

## 🚀 Quick Start

### 1️⃣ Prerequisites

* Node.js (v16+)
* MongoDB Atlas account
* npm or yarn

---

### 2️⃣ Installation

```bash
# Clone the repository
git clone <your-repo-link>
cd financial-app
```

#### Backend Setup

```bash
cd backend
npm install
```

#### Frontend Setup

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

<details>
<summary>📂 Environment Variables</summary>

### Backend (`/backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_private_key
```

### Frontend (`/frontend/.env`)

```env
VITE_API_URL=backendurl
```

</details>

---

## ▶️ Run the Application

### Start Backend

```bash
cd backend
nodemon server.js
```

### Start Frontend

```bash
cd frontend
npm run dev
```

---

## 👥 User Roles & Permissions

> The system is pre-seeded with **50 users**:

* 🛡️ 1 Admin
* 📊 9 Analysts
* 👤 40 Viewers

| Feature                  | Admin   | Analyst          | Viewer            |
| ------------------------ | ------- | ---------------- | ----------------- |
| View Global Dashboard    | ✅       | ✅                | ❌ (Personal Only) |
| View User Directory      | ✅       | ✅ (Viewers only) | ❌                 |
| Suspend/Activate Users   | ✅       | ❌                | ❌                 |
| Create/Edit Transactions | ✅ (All) | ❌                | ❌                 |
| View Personal Profile    | ✅       | ✅                | ✅                 |

---

## 📦 Key Modules

### 📊 1. Financial Analytics

* 📈 Trend Analysis (Income vs Expenses)
* 🍩 Category Distribution (Donut Charts)
* ⚡ Real-time Filtering

### 👥 2. User Management

* 📂 Admin Drawer with transaction history
* 🚫 Suspend / Activate users

### 👤 3. Personal Profile

* 📊 Spending insights
* 🧾 Transaction timeline

---

## 🛠 Tech Stack

### 🎨 Frontend

* React.js
* Tailwind CSS
* Recharts
* Axios
* React Context API
* Framer Motion
* React Hot Toast

### ⚙️ Backend

* Node.js
* Express.js
* JWT Authentication

### 🗄 Database

* MongoDB (Mongoose ODM)

### 💡 UX/UI

* Responsive Design
* Smooth animations
* Toast notifications

---

## ⚖️ Assumptions & Tradeoffs

### 🔐 Security

* JWT stored in `localStorage`
* ⚠️ Recommended: Use **httpOnly cookies** in production (prevents XSS attacks)

### 🔍 Search Logic

* Server-side Regex search
* Efficient for handling **250+ transactions**

### 📊 Data Integrity

* Analysts have **read-only access**
* Prevents accidental data modification

---

## 📄 License

Distributed under the **MIT License**.
See `LICENSE` for more information.

---

## 👨‍💻 Author

**Shyam R Patidar**

---

## 🚀 Future Improvements

* 🔐 Secure authentication (httpOnly cookies)
* 📄 Pagination for large datasets
* 📊 Advanced analytics & predictions
* ⚙️ Custom role management

---

<p align="center">⭐ If you like this project, consider giving it a star!</p>
