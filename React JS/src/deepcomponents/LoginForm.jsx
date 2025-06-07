// LoginForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';

const LoginForm = ({ onLogin }) => {
    const { isDark } = useTheme();
    const [form, setForm] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/login/`,
                form,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            // Store user data and token in localStorage
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userId', response.data.user.id);
            localStorage.setItem('username', response.data.user.username);
            
            if (onLogin) {
                onLogin(response.data.token, response.data.user.id);
            }

            navigate(from, { replace: true });
            
        } catch (error) {
            console.error('Login error:', error);
            toast.error(
                error.response?.data?.message || 
                error.response?.data?.error || 
                'Invalid credentials'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex items-center justify-center min-h-screen ${
            isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <div className={`max-w-md w-full m-4 space-y-8 p-8 rounded-xl shadow-lg ${
                isDark ? 'bg-gray-800' : 'bg-white'
            }`}>
            
                <div>
                    <h2 className={`text-center text-3xl font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                        Sign in to your account
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        <div>
                            <label htmlFor="username" className={`block text-sm font-medium ${
                                isDark ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                    isDark 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                }`}
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className={`block text-sm font-medium ${
                                isDark ? 'text-gray-200' : 'text-gray-700'
                            }`}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
                                    isDark 
                                        ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                                }`}
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
                                isDark 
                                    ? 'bg-indigo-600 hover:bg-indigo-700'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 ${
                                isDark ? 'focus:ring-offset-gray-800' : ''
                            }`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </>
                            ) : 'Sign in'}
                        </button>
                    </div>

                    {/* Register Link */}
                    <div className="text-center">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Don't have an account?{' '}
                        </span>
                        <button
                            type="button"
                            onClick={() => navigate('/register')}
                            className={`font-medium ${
                                isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                            }`}
                        >
                            Register here
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;