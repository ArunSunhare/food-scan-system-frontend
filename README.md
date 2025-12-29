# React Frontend App

A modern React application with a multi-page registration and user selection flow, including an admin dashboard.

## Features

- **Page 1: Register** - User registration with email and password
- **Page 2: Selection** - Choose between Staff or Guest role
- **Page 3: Staff Page** - Staff information form with photo upload and camera capture
- **Page 4: Guest Page** - Guest information form with guest type selection, photo upload and camera capture
- **Admin Login** - Admin authentication page
- **Admin Dashboard** - View and manage all staff and guest registrations

## Installation

1. Install dependencies:
```bash
npm install
```

## Running the App

Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## Pages Flow

1. **Register** (`/register`) - User registration page
2. **Selection** (`/selection`) - Choose Staff or Guest
3. **Staff** (`/staff`) - Staff details form (name, phone, department, photo with file upload or camera capture)
4. **Guest** (`/guest`) - Guest details form (type, name, phone, address, purpose, photo with file upload or camera capture)
5. **Admin Login** (`/admin/login`) - Admin authentication
6. **Admin Dashboard** (`/admin`) - View all registrations

## Admin Access

- **URL**: Navigate to `/admin/login` or click "Admin Login" button on the register page
- **Username**: `admin`
- **Password**: `admin123`

The admin dashboard allows you to:
- View all staff registrations with photos and details
- View all guest registrations with photos and details
- Delete individual entries
- Switch between Staff and Guest tabs
- See submission timestamps

## Technologies Used

- React 18
- React Router DOM 6
- Modern CSS with animations
- Responsive design
- Camera API for photo capture
- LocalStorage for data persistence

