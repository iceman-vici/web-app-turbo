# Web App Turbo

A modern, full-stack web application built with React.js and Node.js

## 🚀 Features

- ✅ User Authentication (JWT)
- ✅ Dashboard with Analytics
- ✅ User Management System
- ✅ Responsive Design
- ✅ Dark/Light Theme
- ✅ RESTful API
- ✅ MongoDB Database
- ✅ Real-time Updates

## 📁 Project Structure

```
web-app-turbo/
├── client/          # React Frontend
├── server/          # Node.js Backend
└── package.json     # Root package.json
```

## 🛠️ Tech Stack

### Frontend
- React.js 18
- React Router v6
- Context API
- Chart.js
- CSS3

### Backend
- Node.js
- Express.js
- MongoDB
- JWT Authentication
- Bcrypt

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/iceman-vici/web-app-turbo.git
cd web-app-turbo
```

2. Install dependencies:
```bash
npm run install:all
```

3. Set up environment variables:
Create a `.env` file in the server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/webappturbo
JWT_SECRET=your_jwt_secret_key
NODE_ENV=development
```

4. Run development servers:
```bash
npm run dev
```

## 🖥️ Usage

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Default Login Credentials
- Email: demo@example.com
- Password: password

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License
