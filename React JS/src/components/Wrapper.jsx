import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Wrapper = ({ children, token, handleLogout }) => {
    const { isDark, toggleTheme } = useTheme();
    const [currentDateTime, setCurrentDateTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentDateTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDateTime = (date) => {
        return date.toISOString().slice(0, 19).replace('T', ' ');
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
            {/* Header */}
            <header className={`${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16">
                    <div className="flex justify-between items-center h-full">
                        {/* Logo */}
                        <div className="flex items-center">
                            <Link to="/" className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                TripForge
                            </Link>
                        </div>

                        {/* Navigation Links */}
                        <div className="hidden md:flex items-center space-x-4">
                            {token && (
                                <Link 
                                    to="/my-bookings" 
                                    className={`px-3 py-2 rounded-md text-sm font-medium 
                                        ${isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'}`}
                                >
                                    My Bookings
                                </Link>
                            )}
                        </div>

                        {/* Right side items */}
                        <div className="flex items-center space-x-4">
                            {/* Theme Toggle */}
                            <button
                                onClick={toggleTheme}
                                className={`p-2 rounded-md ${
                                    isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                {isDark ? (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                                    </svg>
                                ) : (
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                    </svg>
                                )}
                            </button>

                            {/* Auth Buttons */}
                            {token ? (
                                <button
                                    onClick={handleLogout}
                                    className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                                        isDark ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}
                                >
                                    Logout
                                </button>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <Link to="/register" className={`text-sm font-medium ${
                                        isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                                    }`}>
                                        Register
                                    </Link>
                                    <Link to="/login" className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                                        isDark ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'
                                    }`}>
                                        Login
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </nav>
            </header>

            {/* Main Content */}
            <main className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
                {/* DateTime Banner */}
                <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow`}>
                    <div className="flex justify-between items-center">
                        <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{formatDateTime(currentDateTime)} UTC</span>
                        </div>
                        {token && (
                            <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Welcome, Gps-Gaurav</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Page Content */}
                <div className={`bg-white shadow rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Wrapper;