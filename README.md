# Adarsh Dham Management System

## 1. Overview

This project is a full-stack web application designed to manage bookings, events, and accommodations for the Adarsh Dham organization. It provides a comprehensive interface for regular users to make reservations and for administrators to manage the facility's resources, users, and events.

The system is built with a modern technology stack, featuring a React-based frontend and a Node.js/Express backend, all communicating via a RESTful API.

## 2. User Flows and Roles

This section details the primary user flows and the roles associated with each action. The main roles are:
- **Public User:** Any visitor who is not logged in.
- **Authenticated User:** A logged-in user with standard permissions.
- **Operator Roles (`Operator`, `Super Operator`):** Logged-in users responsible for day-to-day booking and allocation management.
- **Specialized Roles (`Satsang Operator`):** Users with permissions for specific content areas.
- **Admin Roles (`Admin`, `Super Admin`):** Users with broad or complete control over the application.

### 2.1. Authentication & Profile Management
- **Registration:** A `Public User` can register for a new account. The account is created with the `Authenticated User` role by default.
- **Login:** `Public Users` can log in to become `Authenticated Users`.
- **Password Recovery:** A `Public User` can request a password reset. An `Admin` can view and manage these requests from the admin dashboard.
- **Profile Updates:** An `Authenticated User` can view and update their own profile information and change their password.
- **User Management:** An `Admin` can view all users and manage their roles (e.g., promoting a user to an `Operator` or `Admin` role).

### 2.2. Booking and Accommodation Flow
- **Create Booking:** An `Authenticated User` submits a booking request for an event. The booking status is initially "pending".
- **Review Pending Bookings:** `Operator` and `Admin` roles are automatically notified of new "pending" bookings. They can then review, approve, or reject these requests.
- **View Bookings:** An `Authenticated User` can view, edit, and cancel their own bookings via the "My Bookings" page.
- **Manage Allocations:** An `Admin` can view all bookings and manage the detailed allocation of specific beds and rooms for each booking.
- **Occupancy Reporting:** An `Admin` can generate reports to view current and future occupancy statistics.

### 2.3. Facility Structure Management (Admin Only)
- **Manage Buildings, Rooms, and Beds:** An `Admin` has full CRUD (Create, Read, Update, Delete) capabilities over the physical structure of the facility, including adding new buildings, defining rooms within them, and specifying the beds in each room.
- **Hierarchical View:** The "Structure View" provides `Admins` with a tree-like representation of the entire facility's layout.

### 2.4. Event and Content Flow
- **View Events:** `Public Users` and `Authenticated Users` can browse a list and calendar of events.
- **Manage Events:** `Admins` have CRUD operations for all events.
- **Manage Satsang Content:** The `Satsang Operator` and `Admins` can create and manage content specifically for Satsang events.
- **Manage Comments:** `Authenticated Users` can post comments. `Admins` can view and moderate all user-submitted comments.

### 2.5. Notifications and Communication
- **Receive Notifications:** `Authenticated Users` can receive notifications sent by administrators and can opt-in to receive web push notifications.
- **Send Notifications:** `Admins` can broadcast custom notifications to all or a select group of users from the admin dashboard.
- **Automated Notifications:** The system automatically sends notifications to `Operators` and `Admins` when new bookings are pending.

### 2.6. Data Management (Admin Only)
- **Export Data:** `Admins` can export various data sets, such as user lists or booking information, into **Excel** and **PDF** formats for offline analysis and record-keeping.

## 3. Technology Stack

### 3.1. Frontend
- **Framework:** React.js
- **State Management:** Redux Toolkit
- **Routing:** React Router
- **Styling:** Tailwind CSS
- **API Communication:** Axios
- **Notifications:** Firebase Cloud Messaging, React Toastify
- **Data Export:** jsPDF, xlsx (SheetJS)
- **Build Tool:** Vite / Create React App (judging by scripts)

### 3.2. Backend
- **Framework:** Node.js with Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JSON Web Tokens (JWT) and bcrypt for password hashing.
- **API Documentation/Logging:** Morgan
- **Scheduled Jobs:** node-schedule (for nightly cleanup and notifications)
- **File Generation:** exceljs, pdfkit
- **Push Notifications:** web-push

## 4. Project Structure

The project is organized into two main directories:
- `/frontend`: Contains the React-based user interface.
- `/backend`: Contains the Express.js server, API routes, database models, and business logic.

## 5. Setup and Installation (Development)

To run this project locally, you will need Node.js and a MongoDB instance.

### 5.1. Backend Setup
1. Navigate to the `backend` directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file in the `backend` root and add the following variables:
   ```
   MONGO_URI=<Your_MongoDB_Connection_String>
   PORT=5000
   VAPID_PUBLIC_KEY=<Your_VAPID_Public_Key>
   VAPID_PRIVATE_KEY=<Your_VAPID_Private_Key>
   JWT_SECRET=<Your_JWT_Secret>
   ```
4. Start the server: `npm run dev`

### 5.2. Frontend Setup
1. Navigate to the `frontend` directory: `cd frontend`
2. Install dependencies: `npm install`
3. Create a `.env.development` file in the `frontend` root and add the following:
   ```
   REACT_APP_API_BASE_URL=http://localhost:5000
   ```
4. Start the frontend development server: `npm start` or `npm run dev`

The application should now be running, with the frontend accessible at `http://localhost:5173` and the backend at `http://localhost:5000`.


Current live website 'https://adarshdham.com'