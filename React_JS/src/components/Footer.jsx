import React from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const Footer = () => {
    const { isDark } = useTheme();
    const currentYear = new Date().getFullYear();

    return (
        <footer className={`${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border-t transition-colors duration-200`}>
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {/* Brand and Description */}
                    <div className="col-span-1 md:col-span-2">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <svg 
                                className={`w-6 h-6 ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}
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
                            <span className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                TripForge
                            </span>
                        </Link>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-sm`}>
                            Your trusted platform for hassle-free bus ticket booking. 
                            Travel with comfort and confidence.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'} tracking-wider uppercase mb-4`}>
                            Quick Links
                        </h3>
                        <div className="space-y-3">
                            <Link 
                                to="/" 
                                className={`block text-sm ${
                                    isDark 
                                        ? 'text-gray-400 hover:text-white' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                Home
                            </Link>
                            <Link 
                                to="/my-bookings" 
                                className={`block text-sm ${
                                    isDark 
                                        ? 'text-gray-400 hover:text-white' 
                                        : 'text-gray-600 hover:text-gray-900'
                                }`}
                            >
                                My Bookings
                            </Link>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className={`text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'} tracking-wider uppercase mb-4`}>
                            Contact
                        </h3>
                        <div className="space-y-3">
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Email: support@tripforge.com
                            </p>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                Phone: +1 (555) 123-4567
                            </p>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
                    <p className={`text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        © {currentYear} TripForge. All rights reserved. Created by {' '}
                        <a 
                            href="https://github.com/Gps-Gaurav" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className={`${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-800'}`}
                        >
                            Gps-Gaurav
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;