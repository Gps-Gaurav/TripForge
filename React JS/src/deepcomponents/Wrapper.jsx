import React from 'react';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const Wrapper = ({ children, token, handleLogout }) => {
    const { isDark } = useTheme();
    
    return (
        <div className={`min-h-screen flex flex-col ${isDark ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-200`}>
            {/* Use the separate Header component */}
            <Header token={token} handleLogout={handleLogout} />

            {/* Main Content */}
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className={`shadow-sm rounded-lg p-6 transition-colors duration-200 ${
                    isDark 
                        ? 'bg-gray-800 text-gray-100' 
                        : 'bg-white text-gray-900'
                }`}>
                    {/* Date Time Banner */}
                    <div className={`mb-6 p-4 rounded-lg ${
                        isDark 
                            ? 'bg-gray-700 text-gray-200' 
                            : 'bg-gray-50 text-gray-700'
                    }`}>
                        <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                            <div className="flex items-center space-x-2">
                                <svg 
                                    className="w-5 h-5" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                >
                                    <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth="2" 
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                                <span className="text-sm font-medium">
                                    2025-06-06 10:09:25 UTC
                                </span>
                            </div>
                            {token && (
                                <div className="flex items-center space-x-2">
                                    <svg 
                                        className="w-5 h-5" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    <span className="text-sm font-medium">
                                        Welcome, Gps-Gaurav
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="prose dark:prose-invert max-w-none">
                        {children}
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className={`${
                isDark 
                    ? 'bg-gray-800 border-gray-700' 
                    : 'bg-white border-gray-200'
            } border-t transition-colors duration-200`}>
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                        {/* Copyright */}
                        <p className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            &copy; {new Date().getFullYear()} TripForge. All rights reserved.
                        </p>

                        {/* Creator Attribution */}
                        <div className={`text-sm ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                            Created with ❤️ by{' '}
                            <a 
                                href="https://github.com/Gps-Gaurav" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`${
                                    isDark 
                                        ? 'text-indigo-400 hover:text-indigo-300' 
                                        : 'text-indigo-600 hover:text-indigo-800'
                                } transition-colors duration-200`}
                            >
                                Gps-Gaurav
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Wrapper;