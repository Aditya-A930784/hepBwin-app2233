# HepBwin - Hepatitis B Prevention Ap

**Your Partner in Hepatitis B Prevention**

A full-stack mobile application built with React Native and Node.js to help users track and prevent Hepatitis B.

## 🏗️ Project Structure

```
hepbwin/
├── client/              # React Native mobile app
│   ├── src/
│   │   ├── screens/     # Screen components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API services
│   │   ├── context/     # Context providers
│   │   ├── hooks/       # Custom hooks
│   │   ├── utils/       # Utility functions
│   │   └── App.js       # Main app component
│   ├── app.json         # Expo configuration
│   └── package.json     # Frontend dependencies
│
└── server/              # Node.js backend API
    ├── routes/          # API routes
    ├── controllers/     # Request handlers
    ├── models/          # Database models
    ├── middleware/      # Custom middleware
    ├── config/          # Configuration files
    ├── services/        # Business logic
    ├── utils/           # Helper functions
    └── server.js        # Server entry point
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (`npm install -g expo-cli`)
- MongoDB (local or cloud)

### Backend Setup

1. Navigate to server directory:
```powershell
cd server
```

2. Install dependencies:
```powershell
npm install
```

3. Create `.env` file with your configuration:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hepbwin
JWT_SECRET=your_jwt_secret_key_here
NODE_ENV=development
```

4. Start the server:
```powershell
npm run dev
```

Server will run on `http://localhost:5000`

### Mobile App Setup

1. Navigate to client directory:
```powershell
cd client
```

2. Install dependencies:
```powershell
npm install
```

3. Create `.env` file:
```env
API_URL=http://localhost:5000/api
```

4. Start the app:
```powershell
npm start
```

5. Run on device:
- Press `a` for Android
- Press `i` for iOS
- Scan QR code with Expo Go app

## 📱 Features (To Be Implemented)

- ✅ Splash Screen with branding
- [ ] User authentication (register/login)
- [ ] Vaccination tracking
- [ ] Appointment scheduling
- [ ] Health tips and information
- [ ] Push notifications
- [ ] Profile management

## 🛠️ Tech Stack

**Frontend:**
- React Native
- Expo
- React Navigation
- Axios

**Backend:**
- Node.js
- Express.js
- MongoDB
- JWT Authentication

## 📝 License

Private - All rights reserved
