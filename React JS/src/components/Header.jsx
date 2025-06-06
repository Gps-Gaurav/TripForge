import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Header = ({ token, handleLogout }) => {
    const { isDark, toggleTheme } = useTheme();
    const [currentDateTime, setCurrentDateTime] = useState('2025-06-06 12:46:32');
    const [username] = useState('Gps-Gaurav');

    // Update current time every second
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            const formatted = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}:${String(now.getUTCSeconds()).padStart(2, '0')}`;
            setCurrentDateTime(formatted);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    return (
        <header className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-b transition-colors duration-200`}>
            <div className={`w-full px-4 py-2 ${isDark ? 'bg-gray-900' : 'bg-gray-100'}`}>
                <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
                    <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center space-x-2`}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{currentDateTime} UTC</span>
                    </div>
                    {token && (
                        <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'} flex items-center space-x-2`}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            <span>{username}</span>
                        </div>
                    )}
                </div>
            </div>

            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Left side - Logo and Brand */}
                    <div className="flex items-center">
                        <Link to="/" className="flex items-center space-x-2">
                            <svg 
                                className={`w-8 h-8 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth="2" 
                                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                                />
                            </svg>
                            <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                TripForge
                            </span>
                        </Link>
                    </div>

                    {/* Middle - Navigation Links */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link 
                            to="/" 
                            className={`px-3 py-2 rounded-md text-sm font-medium ${
                                isDark 
                                    ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                        >
                            Home
                        </Link>
                        {token && (
                            <Link 
                                to="/my-bookings" 
                                className={`px-3 py-2 rounded-md text-sm font-medium ${
                                    isDark 
                                        ? 'text-gray-300 hover:text-white hover:bg-gray-700' 
                                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                                }`}
                            >
                                My Bookings
                            </Link>
                        )}
                    </div>

                    {/* Right side - Auth Buttons and Theme Toggle */}
                    <div className="flex items-center space-x-4">
                        {/* Theme Toggle Button */}
                        <button
                            onClick={toggleTheme}
                            className={`p-2 rounded-md ${
                                isDark 
                                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                            aria-label="Toggle theme"
                        >
                            {isDark ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                    />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                    />
                                </svg>
                            )}
                        </button>

                        {/* Auth Buttons */}
                        {token ? (
                            <button
                                onClick={handleLogout}
                                className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                                    isDark 
                                        ? 'bg-indigo-500 hover:bg-indigo-600' 
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                } transition-colors duration-200`}
                            >
                                Logout
                            </button>
                        ) : (
                            <div className="flex items-center space-x-3">
                                <Link
                                    to="/register"
                                    className={`px-4 py-2 rounded-md text-sm font-medium ${
                                        isDark 
                                            ? 'text-indigo-400 hover:text-indigo-300' 
                                            : 'text-indigo-600 hover:text-indigo-800'
                                    } transition-colors duration-200`}
                                >
                                    Register
                                </Link>
                                <Link
                                    to="/login"
                                    className={`px-4 py-2 rounded-md text-sm font-medium text-white ${
                                        isDark 
                                            ? 'bg-indigo-500 hover:bg-indigo-600' 
                                            : 'bg-indigo-600 hover:bg-indigo-700'
                                    } transition-colors duration-200`}
                                >
                                    Login
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Header;