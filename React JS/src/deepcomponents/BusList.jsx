import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const BusList = ({ token }) => {
    const { isDark } = useTheme();
    const [buses, setBuses] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterOrigin, setFilterOrigin] = useState('')
    const [filterDestination, setFilterDestination] = useState('')

    const navigate = useNavigate()

    useEffect(() => {
        const fetchBuses = async () => {
            try {
                const response = await axios.get("http://localhost:8000/api/buses/")
                setBuses(response.data)
            } catch (error) {
                console.log('error in fetching buses', error)
                setError('Failed to load buses. Please try again later.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchBuses()
    }, [])

    const handleViewSeats = (id) => {
        navigate(`/bus/${id}`)
    }

    const filteredBuses = buses.filter(bus => {
        const matchesSearch = bus.bus_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            bus.number.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesOrigin = filterOrigin ? bus.origin.toLowerCase() === filterOrigin.toLowerCase() : true
        const matchesDestination = filterDestination ? bus.destination.toLowerCase() === filterDestination.toLowerCase() : true
        return matchesSearch && matchesOrigin && matchesDestination
    })

    const uniqueOrigins = [...new Set(buses.map(bus => bus.origin))]
    const uniqueDestinations = [...new Set(buses.map(bus => bus.destination))]

    if (isLoading) {
        return (
            <div className={`flex justify-center items-center min-h-screen ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className={`${isDark ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'} border border-red-400 px-4 py-3 rounded relative`} role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            <h1 className={`text-3xl font-bold mb-8 text-center ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                Available Buses
            </h1>
            
            {/* Filters */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md mb-6`}>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Search
                        </label>
                        <input
                            type="text"
                            placeholder="Search buses..."
                            className={`w-full px-3 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                                isDark 
                                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400' 
                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                            }`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            From
                        </label>
                        <select
                            className={`w-full px-3 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                                isDark 
                                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            value={filterOrigin}
                            onChange={(e) => setFilterOrigin(e.target.value)}
                        >
                            <option value="">All Origins</option>
                            {uniqueOrigins.map(origin => (
                                <option key={origin} value={origin}>{origin}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            To
                        </label>
                        <select
                            className={`w-full px-3 py-2 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 ${
                                isDark 
                                    ? 'bg-gray-700 border-gray-600 text-gray-100' 
                                    : 'bg-white border-gray-300 text-gray-900'
                            }`}
                            value={filterDestination}
                            onChange={(e) => setFilterDestination(e.target.value)}
                        >
                            <option value="">All Destinations</option>
                            {uniqueDestinations.map(destination => (
                                <option key={destination} value={destination}>{destination}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-end">
                        <button
                            onClick={() => {
                                setSearchTerm('')
                                setFilterOrigin('')
                                setFilterDestination('')
                            }}
                            className={`w-full py-2 px-4 rounded font-medium transition-colors duration-200 ${
                                isDark 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                        >
                            Clear Filters
                        </button>
                    </div>
                </div>
            </div>

            {filteredBuses.length === 0 ? (
                <div className="text-center py-12">
                    <h3 className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                        No buses found
                    </h3>
                    <p className={`mt-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Try adjusting your search or filter to find what you're looking for.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredBuses.map((bus) => (
                        <div 
                            key={bus.id} 
                            className={`rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${
                                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                            }`}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                                            {bus.bus_name}
                                        </h2>
                                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                            Bus No: {bus.number}
                                        </p>
                                    </div>
                                    <span className={`${
                                        isDark 
                                            ? 'bg-indigo-900 text-indigo-200' 
                                            : 'bg-indigo-100 text-indigo-800'
                                        } text-xs font-semibold px-2.5 py-0.5 rounded`}>
                                        Available
                                    </span>
                                </div>

                                <div className="mt-4">
                                    <div className={`flex items-center mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                        <span>{bus.origin} → {bus.destination}</span>
                                    </div>

                                    <div className={`flex items-center mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span>Depart: {bus.start_time}</span>
                                    </div>

                                    <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                                        </svg>
                                        <span>Arrive: {bus.reach_time}</span>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <button
                                        onClick={() => handleViewSeats(bus.id)}
                                        className={`w-full py-2 px-4 rounded font-bold transition-colors duration-300 ${
                                            isDark 
                                                ? 'bg-indigo-500 hover:bg-indigo-600 text-white' 
                                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                                        }`}
                                    >
                                        View Seats & Book
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default BusList;