import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const BusList = () => {
    const { isDark } = useTheme();
    const [buses, setBuses] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const navigate = useNavigate()

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                setLoading(true)
                const response = await axios.get("http://localhost:8000/api/buses/")
                setBuses(response.data)
                setError(null)
            } catch (error) {
                console.log('error in fetching buses', error)
                setError('Failed to fetch buses. Please try again later.')
            } finally {
                setLoading(false)
            }
        }
        fetchBuses()
    }, [])

    const handleViewSeats = (id) => {
        navigate(`/bus/${id}`)
    }

    if (loading) {
        return (
            <div className={`flex justify-center items-center h-64 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Loading buses...</span>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-800'}`}>
                {error}
            </div>
        )
    }

    if (buses.length === 0) {
        return (
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'}`}>
                No buses available at the moment.
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Current Time Display */}
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} mb-6`}>
                <div className="flex justify-between items-center">
                    <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>2025-06-06 10:19:35 UTC</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Gps-Gaurav</span>
                    </div>
                </div>
            </div>

            {/* Bus List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {buses.map((bus) => (
                    <div 
                        key={bus.id}
                        className={`rounded-lg overflow-hidden shadow-sm ${
                            isDark 
                                ? 'bg-gray-700 hover:bg-gray-600' 
                                : 'bg-white hover:bg-gray-50'
                        } transition-colors duration-200`}
                    >
                        <div className="p-6">
                            {/* Bus Header */}
                            <div className="mb-4">
                                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                    {bus.bus_name}
                                </h3>
                                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                    Bus Number: {bus.number}
                                </p>
                            </div>

                            {/* Route Info */}
                            <div className="space-y-3 mb-4">
                                <div className={`flex items-center text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                    <span>{bus.origin} → {bus.destination}</span>
                                </div>

                                {/* Time Info */}
                                <div className="flex justify-between">
                                    <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Start: {bus.start_time}</span>
                                    </div>
                                    <div className={`flex items-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Arrive: {bus.reach_time}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={() => handleViewSeats(bus.id)}
                                className={`w-full py-2 px-4 rounded-md text-sm font-medium text-white 
                                    ${isDark 
                                        ? 'bg-indigo-500 hover:bg-indigo-600' 
                                        : 'bg-indigo-600 hover:bg-indigo-700'
                                    } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            >
                                View Seats & Book
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default BusList