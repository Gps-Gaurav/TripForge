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

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    // Format date time to UTC
    const formatDateTime = (date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    // Authentication handlers
    const handleLogin = (token, userId) => {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        setToken(token);
        setUserId(userId);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setToken(null);
        setUserId(null);
        setSelectedBusId(null);
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
            <Wrapper 
                token={token} 
                handleLogout={handleLogout}
                currentDateTime={formatDateTime(currentDateTime)}
                username="Gps-Gaurav"
            >
                <Routes>
                    <Route path="/" element={
                        <BusList 
                            onSelectBus={(id) => setSelectedBusId(id)} 
                            token={token}
                        />
                    } />
                    <Route path="/register" element={<RegisterForm />} />
                    <Route path="/login" element={
                        <LoginForm 
                            onLogin={handleLogin}
                        />
                    } />
                    <Route path="/bus/:busId" element={
                        <BusSeats 
                            token={token}
                        />
                    } />
                    <Route path="/my-bookings" element={
                        <UserBookings 
                            token={token} 
                            userId={userId} 
                        />
                    } />
                </Routes>
            </Wrapper>
        </div>
    );
};

export default App;