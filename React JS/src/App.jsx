import React, { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import RegisterForm from './deepcomponents/RegisterForm'
import LoginForm from './deepcomponents/LoginForm'
import BusList from './deepcomponents/BusList'
import BusSeats from './deepcomponents/BusSeats'
import UserBookings from './deepcomponents/UserBooking'
import Wrapper from './deepcomponents/Wrapper'
import { useTheme } from './context/ThemeContext'

const App = () => {
    // Theme context
    const { isDark } = useTheme();

    // State management
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [userId, setUserId] = useState(localStorage.getItem('userId'));
    const [selectedBusId, setSelectedBusId] = useState(null);
    const [currentDateTime, setCurrentDateTime] = useState(new Date());
    const [username, setUsername] = useState(localStorage.getItem('username') || 'Gps-Gaurav');

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        // Cleanup timer on component unmount
        return () => clearInterval(timer);
    }, []);

    // Format date time to UTC with YYYY-MM-DD HH:MM:SS format
    const formatDateTime = (date) => {
        const pad = (num) => String(num).padStart(2, '0');
        
        const year = date.getUTCFullYear();
        const month = pad(date.getUTCMonth() + 1);
        const day = pad(date.getUTCDate());
        const hours = pad(date.getUTCHours());
        const minutes = pad(date.getUTCMinutes());
        const seconds = pad(date.getUTCSeconds());

        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    };

    // Authentication handlers
    const handleLogin = (token, userId, username = 'Gps-Gaurav') => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        localStorage.setItem('username', username);
        setToken(token);
        setUserId(userId);
        setUsername(username);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        setToken(null);
        setUserId(null);
        setSelectedBusId(null);
        setUsername('');
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
            <Wrapper 
                token={token} 
                handleLogout={handleLogout}
                currentDateTime={formatDateTime(currentDateTime)}
                username={username}
                isDark={isDark}
            >
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} transition-colors duration-200`}>
                    <Routes>
                        <Route 
                            path="/" 
                            element={
                                <BusList 
                                    onSelectBus={(id) => setSelectedBusId(id)} 
                                    token={token}
                                    isDark={isDark}
                                />
                            } 
                        />
                        <Route 
                            path="/register" 
                            element={<RegisterForm isDark={isDark} />} 
                        />
                        <Route 
                            path="/login" 
                            element={
                                <LoginForm 
                                    onLogin={handleLogin}
                                    isDark={isDark}
                                />
                            } 
                        />
                        <Route 
                            path="/bus/:busId" 
                            element={
                                <BusSeats 
                                    token={token}
                                    isDark={isDark}
                                />
                            } 
                        />
                        <Route 
                            path="/my-bookings" 
                            element={
                                <UserBookings 
                                    token={token} 
                                    userId={userId}
                                    isDark={isDark}
                                />
                            } 
                        />
                    </Routes>
                </div>
            </Wrapper>
        </div>
    );
};

export default App;