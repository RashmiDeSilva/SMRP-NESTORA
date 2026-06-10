# SMRP Nestora

**Smart Boarding Reservation and Management Platform**

SMRP Nestora is a mobile application developed using **React Native (Expo)** and the **MERN Stack** to help students, interns, employees, and boarding owners manage accommodation searching, booking, payments, and communication through a centralized platform.

## Main Features

### 1. User & Boarding Management

#### User Management

* User Registration and Authentication
* Role-Based Access Control (Admin, Boarding Owner, Student, Intern, Employee)
* Profile Management
* Secure Login and Authorization

#### Boarding Management

* Add and Manage Boarding Listings
* Room Availability Management
* Facility and Pricing Management
* Property Image Management
* AR Room Viewing Support

#### Accommodation Search & Discovery

* Search by Location, University, or Workplace
* Advanced Filtering Options
* Wishlist and Favourite Boardings
* Detailed Boarding Information
* Map Integration

---

### 2. Booking, Reservation & Payment Management

#### Booking Management

* Room and Bed Reservations
* Booking Approval Workflow
* Booking History Tracking
* Booking Cancellation

#### Reservation Management

* Reservation Approval and Rejection
* Reservation Status Tracking
* Check-in and Check-out Management
* Reservation History

#### Payment Management

* Online and Offline Payments
* Payment Receipt Upload
* Payment Verification
* Refund Management
* Transaction History

#### Contract Management

* Digital Contract Generation
* Contract Storage and Retrieval
* Terms and Conditions Management
* Contract Status Tracking

---

### 3. Notifications, Reviews & Complaint Management

#### Notification Management

* Real-Time Notifications
* Booking and Reservation Updates
* Payment Confirmation Alerts
* Notification History

#### Announcement Management

* Boarding Owner Announcements
* Maintenance Notices
* Rent Reminders
* Emergency Notifications

#### Review & Rating Management

* Five-Star Rating System
* Written Reviews
* Review History
* Review Moderation

#### Complaint Management

* Complaint Submission
* Evidence Attachment Support
* Complaint Tracking
* Resolution Notifications

---

### 4. Cost of Living Analysis

#### Monthly Cost Calculator

* Rent Calculation
* Utility Cost Estimation
* Food and Transport Expenses
* Expense Breakdown

#### Boarding Comparison Tool

* Compare Multiple Boarding Options
* Cost Comparison Analysis
* Best Value Recommendations

#### Financial Planning Dashboard

* Budget Planning
* Expense Monitoring
* Monthly Financial Reports
* Budget Alerts

#### Cost Visualization

* Expense Charts and Graphs
* Interactive Dashboard
* Financial Analytics


## Technology Stack

### Frontend

* React Native
* Expo
* Redux Toolkit
* NativeWind (Tailwind CSS)

### Backend

* Node.js
* Express.js

### Database

* MongoDB Atlas
* Mongoose

### Security

* JWT Authentication
* Bcrypt Password Hashing
* Role-Based Access Control (RBAC)

### Additional Services

* Cloudinary
* Google Maps API
* Firebase Cloud Messaging (FCM)
* Socket.io
* PayHere / Stripe

## Project Structure
```text
SMRP-NESTORA/
│
├── backend/                 # Backend API and server-side logic
│   ├── config/              # Database and application configurations
│   ├── controllers/         # Request handling logic
│   ├── middleware/          # Authentication and custom middleware
│   ├── models/              # MongoDB/Mongoose models
│   └── routes/              # API routes
│
├── docs/                    # Project documentation
│   ├── diagrams/            # System diagrams and UML diagrams
│   ├── proposal/            # Project proposal documents
│   └── reports/             # Reports and project deliverables
│
├── frontend/                # React Native mobile application
│   ├── assets/              # Images, icons, and static resources
│   └── src/
│       ├── components/      # Reusable UI components
│       ├── navigation/      # Navigation configuration
│       └── screens/         # Application screens/pages
│
└── README.md                # Project documentation
```

## Team Members

| Member          | Module                                    |
| --------------- | ----------------------------------------- |
| Gunasena P.G.P  | User & Boarding Management                |
| Rashmi De Silva | Booking, Reservation & Payment Management |
| Anupama M.L.M   | Notifications, Reviews & Complaints       |
| Liyanage S.L.U  | Cost of Living Analysis                   |

## Installation

### Clone Repository

```bash
git clone https://github.com/RashmiDeSilva/SMRP-NESTORA
cd SMRP-NESTORA
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npx expo start
```

## Future Enhancements

* AI Boarding Recommendations
* Real-Time Chat System
* Smart Room Matching
* Voice Search
* AI Cost Prediction
* Multi-Language Support
* Advanced AR Experience



This project is developed for academic and educational purposes.


