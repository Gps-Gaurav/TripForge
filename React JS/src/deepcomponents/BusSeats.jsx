import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'

const BusSeats = ({ token }) => {
    const { isDark } = useTheme();
    const [bus, setBus] = useState(null)
    const [seats, setSeats] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedSeat, setSelectedSeat] = useState(null)

    const { busId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBusDetails = async () => {
            try {
                const response = await axios(`http://localhost:8000/api/buses/${busId}`)
                setBus(response.data)
                setSeats(response.data.seats || [])
            } catch (error) {
                console.log('Error in fetching details', error)
                setError('Failed to load bus details. Please try again later.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchBusDetails()
    }, [busId])

    const handleBook = async (seatId) => {
        if (!token) {
            alert('Please login to book a seat');
            navigate('/login');
            return;
        }

        try {
            const res = await axios.post(
                'http://localhost:8000/api/booking/',
                { seat: seatId },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
            alert('Booking successful!');
            setSeats((prevSeats) =>
                prevSeats.map((seat) =>
                    seat.id === seatId ? { ...seat, is_booked: true } : seat
                )
            );
        } catch (error) {
            alert(error.response?.data?.error || 'Please login to book a seat')
            navigate('/login');
        }
    };

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
                <div className={`${
                    isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'
                } border border-red-400 px-4 py-3 rounded relative`} role="alert">
                    <strong className="font-bold">Error! </strong>
                    <span className="block sm:inline">{error}</span>
                </div>
            </div>
        )
    }

    return (
        <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {/* Bus Details Card */}
            {bus && (
                <div className={`${
                    isDark ? 'bg-gray-800' : 'bg-white'
                } rounded-xl shadow-md overflow-hidden mb-8 transition-colors duration-200`}>
                    <div className="p-6">
                        <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                            {bus.bus_name}
                        </h1>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Journey Details */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-500'}`}>
                                    Journey Details
                                </h3>
                                <div className="space-y-2">
                                    <p className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        </svg>
                                        <span className="font-medium">Route:</span> {bus.origin} → {bus.destination}
                                    </p>
                                    <p className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Departure:</span> {bus.start_time}
                                    </p>
                                    <p className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Arrival:</span> {bus.reach_time}
                                    </p>
                                    <p className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="font-medium">Bus Number:</span> {bus.number}
                                    </p>
                                </div>
                            </div>
                            
                            {/* Seat Legend */}
                            <div>
                                <h3 className={`text-lg font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                                    Seat Legend
                                </h3>
                                <div className="flex flex-wrap gap-4">
                                    <div className="flex items-center">
                                        <div className={`w-6 h-6 ${isDark ? 'bg-green-600' : 'bg-green-500'} rounded-md mr-2`}></div>
                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Available</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-6 h-6 ${isDark ? 'bg-red-600' : 'bg-red-500'} rounded-md mr-2`}></div>
                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Booked</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className={`w-6 h-6 ${isDark ? 'bg-yellow-600' : 'bg-yellow-500'} rounded-md mr-2`}></div>
                                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Selected</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Seats Selection */}
            <div className={`${
                isDark ? 'bg-gray-800' : 'bg-white'
            } rounded-xl shadow-md overflow-hidden transition-colors duration-200`}>
                <div className="p-6">
                    <h2 className={`text-xl font-bold mb-6 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        Select Your Seat
                    </h2>
                    
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {seats.map((seat) => (
                            <button
                                key={seat.id}
                                onClick={() => !seat.is_booked && handleBook(seat.id)}
                                disabled={seat.is_booked || selectedSeat === seat.id}
                                className={`relative p-4 rounded-lg flex flex-col items-center justify-center transition-all duration-200 ${
                                    seat.is_booked 
                                        ? isDark ? 'bg-red-900 cursor-not-allowed' : 'bg-red-100 cursor-not-allowed'
                                        : selectedSeat === seat.id
                                            ? isDark ? 'bg-yellow-700' : 'bg-yellow-100'
                                            : isDark 
                                                ? 'bg-green-700 hover:bg-green-600 cursor-pointer' 
                                                : 'bg-green-100 hover:bg-green-200 cursor-pointer'
                                }`}
                            >
                                <span className={`text-lg font-medium ${
                                    isDark
                                        ? seat.is_booked ? 'text-red-200' : 'text-gray-100'
                                        : seat.is_booked ? 'text-red-800' : 'text-green-800'
                                }`}>
                                    {seat.seat_number}
                                </span>
                                {seat.is_booked && (
                                    <span className={`text-xs ${isDark ? 'text-red-300' : 'text-red-600'} mt-1`}>
                                        Booked
                                    </span>
                                )}
                                {selectedSeat === seat.id && !seat.is_booked && (
                                    <div className="absolute top-0 right-0 -mt-2 -mr-2">
                                        <div className={`animate-ping h-4 w-4 rounded-full ${
                                            isDark ? 'bg-yellow-500' : 'bg-yellow-400'
                                        } opacity-75`}></div>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* View Bookings Button */}
            <button
                onClick={() => navigate('/my-bookings')}
                className={`mt-4 px-4 py-2 rounded transition-colors duration-200 ${
                    isDark
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
            >
                View Booking Details
            </button>
        </div>
    )
}

export default BusSeats;