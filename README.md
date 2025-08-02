# Basic Bank App to Explore Node.js, React.js, and JWT Authentication - Client Side

This is the **frontend** for a full-stack banking web application built with React, TypeScript, and Zustand for state management.

## Description

A responsive web bank application that enables users to register using a strong password and verify their email address before accessing the system. Upon successful registration, a default bank account is automatically created and ready for immediate use and user will be redirected to login and the account will be fetched. Users can log in to their account, manage multiple bank accounts, and perform money transfers to other registered users.

## Core API Features

- **User Signup** with strong password enforcement
- **Email Verification** after registration
- **Login** with JWT-based authentication
- **Account Management:**
  - Create additional bank accounts
  - Switch between accounts
  - Set a default account
  - Update personal details
- **Transaction System:**
  - Transfer money to other users
  - Transaction view with pagination

## Technologies Used

- React.js (TypeScript)
- Zustand (State Management)
- TailwindCSS (Styling)
- React Router (navigation)
- Axios (API requests)
- React Toastify (Notifications)

## How to Use This App

[**Live Demo Link Here**](https://bank-app-client-pink.vercel.app/)

[**Git Repo Server**](https://github.com/OffirRokach/bank-app-server)

You can try the app immediately with this test user:

- Email: david.day@example.com
- Password: SecurePass123!

Access Token duration is 15 minutes.



