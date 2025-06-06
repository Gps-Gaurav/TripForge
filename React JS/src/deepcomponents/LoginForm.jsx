import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext' // Add this import

const LoginForm = ({ onLogin }) => {
    const { isDark } = useTheme() // Add this hook
    const [form, setForm] = useState({
        username: '', password: ''
    })
    const [message, setMessage] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const navigate = useNavigate()
    const location = useLocation();
    const from = location.state?.from?.pathname || '/';

    const handleSubmit = async (e) => {
        e.preventDefault()
        setIsLoading(true)
        try {
            const response = await axios.post('http://localhost:8000/api/login/', form)
            setMessage('Login Success')
            if (onLogin) {
                onLogin(response.data.token, response.data.user_id)
            }
            navigate("/")
        } catch (error) {
            setMessage("Login Failed: " + (error.response?.data?.message || 'Invalid credentials'))
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className={`flex items-center justify-center ${isDark ? 'bg-gray-900' : 'bg-gray-50'} py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200`}>
            <div className={`max-w-md w-full space-y-8 ${isDark ? 'bg-gray-800' : 'bg-white'} p-8 rounded-xl shadow-lg transition-colors duration-200`}>
                <div>
                    <h2 className={`mt-6 text-center text-3xl font-extrabold ${isDark ? 'text-white' : 'text-gray-900'} transition-colors duration-200`}>
                        Sign in to your account
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div>
                            <label htmlFor="username" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                                Username
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm 
                                    ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} 
                                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200`}
                                value={form.username}
                                onChange={handleChange}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className={`block text-sm font-medium ${isDark ? 'text-gray-200' : 'text-gray-700'} transition-colors duration-200`}>
                                Password
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className={`mt-1 appearance-none block w-full px-3 py-2 border rounded-md shadow-sm 
                                    ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'} 
                                    focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors duration-200`}
                                value={form.password}
                                onChange={handleChange}
                            />
                        </div>
                    </div>

                    {message && (
                        <div className={`rounded-md p-4 ${
                            message.includes('Success') 
                                ? (isDark ? 'bg-green-900 text-green-100' : 'bg-green-50 text-green-800')
                                : (isDark ? 'bg-red-900 text-red-100' : 'bg-red-50 text-red-800')
                        } transition-colors duration-200`}>
                            <p className="text-sm">{message}</p>
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white 
                                ${isDark ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-600 hover:bg-indigo-700'}
                                focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors duration-200`}
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    <span className="text-white">Signing in...</span>
                                </>
                            ) : 'Sign in'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default LoginForm