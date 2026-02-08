# Adarsh Dham Management System

## 1. Overview

This project is a full-stack web application designed to manage bookings, events, and accommodations for the Adarsh Dham organization. It provides a comprehensive interface for regular users to make reservations and for administrators to manage the facility's resources, users, and events.

## 2. Key Features

### User Features
- **Authentication**: Secure login/signup via Phone (OTP) or Google OAuth.
- **Booking System**: Smart booking flow preventing conflicts. Users can view and manage their bookings.
- **Events Calendar**: Browse upcoming satsangs and events.
- **Push Notifications**: Receive updates about bookings and events.
- **Comments**: Engage with community content.

### Admin Features
- **Dashboard**: Overview of system status.
- **Booking Management**: Approve/Reject bookings, manage allocations (Rooms/Beds).
- **Facility Management**: Manage Buildings, Rooms, and Beds structure.
- **Live Structure View**: Visual hierarchy of the ashram's accommodation.
- **User Management**: Manage roles (Admin, Operator, Satsang Operator) and permissions.
- **Reports**: Generate Occupancy Reports and export data (Excel/PDF).
- **Notifications**: Send custom push notifications to users.
- **Short Links**: Create custom redirect links (e.g., `../is-live`) for easy sharing.
- **Discount Management**: Manage product/service discounts.
- **Satsang Management**: Specialized content management for spiritual events.

## 3. Technology Stack

### Frontend
- **Framework**: React.js (Create React App)
- **State Management**: Redux Toolkit & Redux Persist
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS, Framer Motion
- **HTTP Client**: Axios
- **Notifications**: React Toastify, Firebase Cloud Messaging
- **Utilities**: Date-fns, Luxon, XLSX, jsPDF

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT (JSON Web Tokens), Google OAuth, OTP-based login
- **Scheduling**: node-schedule (Cron jobs for cleanup/notifications)
- **Email**: Nodemailer (Gmail Service)
- **Push Notifications**: web-push with VAPID keys

## 4. Setup and Installation

### Prerequisites
- Node.js (v16+)
- MongoDB Atlas or Local Instance

### Backend Setup
1. Navigate to `backend/`:
   ```bash
   cd backend
   npm install
   ```
2. Create `.env` file:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_super_secret_key
   
   # Push Notifications (VAPID)
   VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   
   # Email Service (Gmail)
   GMAIL_USER=your-email@gmail.com
   GMAIL_APP_PASSWORD=your-app-password
   
   # Optional Admin Defaults
   SUPER_ADMIN_PHONE=...
   SUPER_ADMIN_PASSWORD=...
   ```
3. Run Server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to `frontend/`:
   ```bash
   cd frontend
   npm install
   ```
2. Create `.env.development` file:
   ```env
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```
3. Run Client:
   ```bash
   npm start
   ```

## 5. Deployment
- **Frontend**: Vercel (recommended)
- **Backend**: Render / Vercel / Heroku

## 6. Project Structure
- `/backend`: API Server, Models, Controllers, Routes.
- `/frontend`: React App, Components, Pages, Redux Slices.