// RegisterForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useTheme } from '../context/ThemeContext'; // Make sure this path is correct

const RegisterForm = () => {
    const navigate = useNavigate();
    const { isDark } = useTheme(); // Get dark mode state
    const [form, setForm] = useState({
        username: '',
        email: '',
        password: '',
        password2: '',
        first_name: '',
        last_name: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        if (form.password !== form.password2) {
            toast.error("Passwords don't match!");
            setIsLoading(false);
            return;
        }

        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/register/`,
                form,
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 201) {
                toast.success('Registration successful! You can now login.');
                navigate('/login');
            }
        } catch (error) {
            console.error('Registration error:', error);
            
            if (error.response?.data?.details) {
                Object.entries(error.response.data.details).forEach(([field, errors]) => {
                    toast.error(`${field}: ${errors.join(', ')}`);
                });
            } else {
                toast.error(error.response?.data?.error || 'Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Dynamic classes based on dark mode
    const inputClassName = `mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm ${
        isDark 
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400'
            : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
    }`;

    const labelClassName = `block text-sm font-medium ${
        isDark ? 'text-gray-200' : 'text-gray-700'
    }`;

    return (
        <div className={`flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 min-h-screen ${
            isDark ? 'bg-gray-900' : 'bg-gray-50'
        }`}>
            <div className={`max-w-md w-full space-y-8 p-8 rounded-xl shadow-lg ${
                isDark ? 'bg-gray-800' : 'bg-white'
            }`}>

                <div>
                    <h2 className={`text-center text-3xl font-extrabold ${
                        isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                        Create a new account
                    </h2>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md space-y-4">
                        <div>
                            <label htmlFor="username" className={labelClassName}>
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className={inputClassName}
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className={labelClassName}>
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                className={inputClassName}
                                value={form.email}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="first_name" className={labelClassName}>
                                First Name
                            </label>
                            <input
                                id="first_name"
                                name="first_name"
                                type="text"
                                required
                                className={inputClassName}
                                value={form.first_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="last_name" className={labelClassName}>
                                Last Name
                            </label>
                            <input
                                id="last_name"
                                name="last_name"
                                type="text"
                                required
                                className={inputClassName}
                                value={form.last_name}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className={labelClassName}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={inputClassName}
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label htmlFor="password2" className={labelClassName}>
                                Confirm Password
                            </label>
                            <input
                                id="password2"
                                name="password2"
                                type="password"
                                required
                                className={inputClassName}
                                value={form.password2}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
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
                                    Registering...
                                </>
                            ) : 'Register'}
                        </button>
                    </div>

                    {/* Login link */}
                    <div className="text-center">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                            Already have an account?{' '}
                        </span>
                        <button
                            type="button"
                            onClick={() => navigate('/login')}
                            className={`font-medium ${
                                isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-500'
                            }`}
                        >
                            Login here
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterForm;