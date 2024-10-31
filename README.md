# E-Commerce System

## Overview

This is a full-featured **E-commerce system** developed using **Node.js** (with the Express framework) for the back-end, **React** for the front-end, and **MongoDB** as the database for data storage. The system supports user authentication, product management, cart functionalities, and an admin interface to manage purchases and productsby adding and deleting products.

## Features

### **User Features**:
1. **Authentication**:
   - **Sign Up**: Users can create new accounts.
   - **Sign In**: Users can log in using their email and password.

2. **Product Interactions**:
   - **Add to Wishlist**: Save favorite items for future purchases.
   - **Buy Now**: Direct purchase of an item.
   - **Add to Cart**: Add multiple products to the shopping cart.
   - **Update Cart**: Modify product quantities or remove items from the cart.
   - **Checkout**: Secure checkout for completing orders.

### **Admin Features**:
1. **Admin UI**: Dashboard interface for managing the system.
2. **Product Management**:
   - **Add Products**: Admins can add new products to the store.
   - **Edit Products**: Modify existing product details by the admin.
   - **Delete Products**: Remove products from the store.
3. **Purchase Approvals**:
   - Approve or decline purchases made by users.


## Tech Stack

### **Back-End**:
- **Node.js** with **Express** framework
- **MongoDB** for database storage

### **Front-End**:
- **React.js** for building user interfaces

### **Database**:
- **MongoDB**: Document-based NoSQL database

### Prerequisites:
- Node.js installed
- MongoDB installed or use a cloud provider like MongoDB Atlas


## Installation
1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd <repository-directory>
   
2. **Initialize npm(only required if package.json doesnot exists):**
   npm init -y

3. ***Install dependencies**
   npm install

4. **Set up the environment variables:**
   Create a .env file in the root directory.
   Add any necessary environment variables as required by the project.
   Common variables might include:
   PORT= 3000
   MONGO_URI= "localhost:3000"

5. **Run the project**
   npm start
   npm run dev
