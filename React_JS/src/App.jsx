import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route } from 'react-router-dom';
import RegisterForm from './deepcomponents/RegisterForm';
import LoginForm from './deepcomponents/LoginForm';
import BusList from './components/BusList/BusList';
import BusSeats from './components/BusSeats/BusSeats';
import UserBookings from './components/UserBooking/UserBookings';
import Wrapper from './deepcomponents/Wrapper';
import { useTheme } from './context/ThemeContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  const { isDark } = useTheme();

  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [username, setUsername] = useState(localStorage.getItem('username') || 'Gps-Gaurav');
  const [currentDateTime, setCurrentDateTime] = useState('');

  // Format date time to UTC YYYY-MM-DD HH:MM:SS
  const formatDateTime = useCallback(() => {
    const date = new Date();
    const pad = (num) => String(num).padStart(2, '0');

    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }, []);

  // Update current time every second (optional)
  useEffect(() => {
    setCurrentDateTime(formatDateTime());
    const timer = setInterval(() => {
      setCurrentDateTime(formatDateTime());
    }, 1000);
    return () => clearInterval(timer);
  }, [formatDateTime]);

  // Login handler
  const handleLogin = (token, userId, username = 'Gps-Gaurav') => {
    try {
      localStorage.setItem('token', token);
      localStorage.setItem('userId', userId);
      localStorage.setItem('username', username);
      setToken(token);
      setUserId(userId);
      setUsername(username);
      toast.success('Login successful!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
    }
  };

  // Logout handler
  const handleLogout = () => {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      localStorage.removeItem('username');
      setToken(null);
      setUserId(null);
      setUsername('');
      toast.info('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
      <Wrapper
        token={token}
        handleLogout={handleLogout}
        currentDateTime={currentDateTime}
        username={username}
        isDark={isDark}
      >
        <Routes>
          <Route
            path="/"
            element={<BusList token={token} isDark={isDark} />}
          />
          <Route
            path="/register"
            element={<RegisterForm isDark={isDark} />}
          />
          <Route
            path="/login"
            element={<LoginForm onLogin={handleLogin} isDark={isDark} />}
          />
          <Route
            path="/bus/:busId"
            element={<BusSeats token={token} isDark={isDark} />}
          />
          <Route
            path="/my-bookings"
            element={<UserBookings token={token} userId={userId} isDark={isDark} />}
          />
        </Routes>
      </Wrapper>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={isDark ? 'dark' : 'light'}
        limit={1}
      />
    </div>
  );
};

export default App;
