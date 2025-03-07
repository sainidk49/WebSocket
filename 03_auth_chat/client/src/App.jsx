import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoutes from './protected/ProtectedRoutes';
import Login from './pages/Login';
import Chat from './pages/Chat';
import Register from './pages/Register';
import Home from './pages/Home';
import AuthProvider from './context/AuthProvider';
import "./App.css"
import UserList from './pages/UserList';
import Profile from './pages/Profile';
import ProfileImage from './components/profile/ProfileImage';

function App() {
  return (
    <div className='main-hero'>
      <div className='common-section relative w-full h-full bg-[url(/assets/images/bg.jpg)] max-w-md mx-auto'>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
              {/* Protected routes */}
              <Route element={<ProtectedRoutes />}>
                <Route path="/" element={<Home />} />
                <Route path="/users" element={<UserList />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile-image" element={<ProfileImage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </div>
    </div>
  );
}

export default App;
