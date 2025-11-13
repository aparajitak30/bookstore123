Online BookStore Web Application

An interactive online bookstore where users can browse, search, and purchase books with ease.
Built using HTML, CSS, JavaScript (Frontend) and powered by a Node.js + Express + Firebase Firestore backend, it provides a seamless and secure shopping experience.

Features

User authentication (Login/Register using JWT & bcrypt)

Dynamic book listings from Firebase Firestore

Add to Cart & real-time total calculation

Secure checkout process

Newsletter subscription with email validation

Responsive and modern UI design

Admin access for adding new books

Architecture
Frontend (HTML/CSS/JS)  →  Express Server (Node.js)  →  Firebase Firestore  
                                     ↘ JWT Auth + Cart API ↙
                             Authentication & Checkout Flow

Use Cases

Online Shopping – Users can explore and buy books easily

Admin Management – Admins can add or manage book details

Educational Institutions – Students can access digital book collections

Book Retailers – Manage and track book inventory seamlessly

Tech Stack
Component	Technology
Frontend	HTML, CSS, JavaScript
Backend	Node.js, Express.js
Database	Firebase Firestore
Authentication	JWT, bcrypt
Hosting	Firebase Hosting / Render / Vercel
Version Control	GitHub
Working Steps

User registers or logs in via the authentication modal

Book data is fetched dynamically from Firestore

Users can add books to the cart

Cart total updates automatically

Checkout details stored securely

Newsletter subscription captured in Firestore

Testing

Test user registration and login flow

Add multiple books and verify cart updates

Validate JWT authentication for secure routes

Confirm Firestore stores all data correctly

Test email subscription and form validation

Folder Structure
bookstore/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── serviceAccountKey.json
│   └── .env
│
└── frontend/
    ├── index.html
    ├── style.css
    ├── script.js
    └── assets/

Setup & Run Locally
Clone the repository
git clone https://github.com/your-username/bookstore.git
cd bookstore/backend

Install dependencies
npm install

Create a .env file
PORT=3001
JWT_SECRET=your_secret_key

Run the backend
node server.js

Open frontend

Open frontend/index.html in your browser or use Live Server in VS Code.

References

Firebase Firestore Documentation

Node.js Documentation

Express.js Documentation

JWT Authentication Guide

Final Hosted Link

View Live App
 (Add your deployment link here once hosted)
