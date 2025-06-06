import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Reusable Modal Component
const Modal = ({ isOpen, onClose, title, children, isDark }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50" aria-modal="true">
            {/* Overlay */}
            <div 
                className="fixed inset-0 bg-black/50 transition-opacity backdrop-blur-sm" 
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-0 z-50 overflow-y-auto">
                <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                    <div className={`relative transform overflow-hidden rounded-lg text-left transition-all sm:my-8 sm:w-full sm:max-w-lg ${
                        isDark ? 'bg-gray-800' : 'bg-white'
                    } px-4 pb-4 pt-5 sm:p-6 sm:pb-4 shadow-xl`}>
                        {/* Header */}
                        <div className="mb-4 border-b pb-4 border-gray-200 dark:border-gray-700">
                            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {title}
                            </h3>
                        </div>

                        {/* Content */}
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};

const BusSeats = ({ token }) => {
    const { isDark } = useTheme();
    const [bus, setBus] = useState(null);
    const [seats, setSeats] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [seatToBook, setSeatToBook] = useState(null);
    const [seatToCancel, setSeatToCancel] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [cancelOpen, setCancelOpen] = useState(false);
    const [currentDateTime] = useState("2025-06-06 11:36:11");
    const [username] = useState("Gps-Gaurav");

    const { busId } = useParams();
    const navigate = useNavigate();

    // Fetch bus details
    useEffect(() => {
        const fetchBusDetails = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`http://localhost:8000/api/buses/${busId}`);
                setBus(response.data);
                setSeats(response.data.seats || []);
            } catch (error) {
                setError('Failed to load bus details. Please try again later.');
                toast.error('Error loading bus details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBusDetails();
    }, [busId]);

    // Booking handler
    const handleBook = async (seatId) => {
        if (!token) {
            toast.error('Please login to book a seat');
            navigate('/login');
            return;
        }
        setSelectedSeat(seatId);
        setSeatToBook(seatId);
        setConfirmOpen(true);
    };

    // Confirm booking
    const confirmBooking = async () => {
        try {
            await axios.post(
                'http://localhost:8000/api/booking/',
                { seat: seatToBook },
                {
                    headers: { Authorization: `Token ${token}` }
                }
            );
            
            setSeats(prevSeats => 
                prevSeats.map(seat => 
                    seat.id === seatToBook ? { ...seat, is_booked: true } : seat
                )
            );
            
            toast.success('Booking successful!');
            setConfirmOpen(false);
            setSelectedSeat(null);
            setSeatToBook(null);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Booking failed');
            if (error.response?.status === 401) navigate('/login');
        }
    };

    // Cancel booking
    const handleCancel = async () => {
        try {
            await axios.delete(
                `http://localhost:8000/api/booking/${seatToCancel}/`,
                {
                    headers: { Authorization: `Token ${token}` }
                }
            );
            
            setSeats(prevSeats => 
                prevSeats.map(seat => 
                    seat.id === seatToCancel ? { ...seat, is_booked: false } : seat
                )
            );
            
            toast.success('Booking cancelled successfully');
            setCancelOpen(false);
            setSelectedSeat(null);
            setSeatToCancel(null);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Cancellation failed');
        }
    };

    // Loading state
    if (isLoading) {
        return (
            <div className={`flex justify-center items-center min-h-screen ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className={`${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'} 
                    border border-red-400 px-4 py-3 rounded`}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {/* DateTime Banner */}
            <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{currentDateTime} UTC</span>
                    </div>
                    <div className={`flex items-center gap-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>{username}</span>
                    </div>
                </div>
            </div>

            {/* Bus Details */}
            {bus && (
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6 mb-8`}>
                    <h2 className="text-2xl font-bold mb-4">Bus Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Bus Info */}
                        <div className="space-y-3">
                            <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="font-medium w-24">Bus Name:</span>
                                <span>{bus.bus_name}</span>
                            </div>
                            <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="font-medium w-24">Number:</span>
                                <span>{bus.number}</span>
                            </div>
                            <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="font-medium w-24">Route:</span>
                                <span>{bus.origin} → {bus.destination}</span>
                            </div>
                        </div>

                        {/* Time Info */}
                        <div className="space-y-3">
                            <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="font-medium w-24">Departure:</span>
                                <span>{bus.start_time}</span>
                            </div>
                            <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                <span className="font-medium w-24">Arrival:</span>
                                <span>{bus.reach_time}</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Seats Grid */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className="text-2xl font-bold mb-6">Select Your Seat</h2>
                
                {/* Seat Legend */}
                <div className="flex gap-4 mb-6">
                    <div className="flex items-center">
                        <div className={`w-4 h-4 ${isDark ? 'bg-green-600' : 'bg-green-500'} rounded mr-2`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Available</span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-4 h-4 ${isDark ? 'bg-red-600' : 'bg-red-500'} rounded mr-2`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Booked</span>
                    </div>
                    <div className="flex items-center">
                        <div className={`w-4 h-4 ${isDark ? 'bg-yellow-600' : 'bg-yellow-500'} rounded mr-2`} />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Selected</span>
                    </div>
                </div>

                {/* Seats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {seats.map((seat) => (
                        <button
                            key={seat.id}
                            onClick={() => seat.is_booked ? handleCancel(seat.id) : handleBook(seat.id)}
                            className={`p-4 rounded-lg transition-all duration-200 ${
                                seat.id === selectedSeat
                                    ? isDark ? 'bg-yellow-600' : 'bg-yellow-100'
                                    : seat.is_booked 
                                        ? isDark 
                                            ? 'bg-red-900 cursor-pointer'
                                            : 'bg-red-100 cursor-pointer'
                                        : isDark
                                            ? 'bg-green-700 hover:bg-green-600 cursor-pointer'
                                            : 'bg-green-100 hover:bg-green-200 cursor-pointer'
                            }`}
                        >
                            <div className={`text-center ${
                                seat.id === selectedSeat
                                    ? isDark ? 'text-white' : 'text-yellow-800'
                                    : seat.is_booked
                                        ? isDark ? 'text-red-200' : 'text-red-800'
                                        : isDark ? 'text-gray-100' : 'text-green-800'
                            }`}>
                                <div className="font-medium">Seat</div>
                                <div className="text-lg">{seat.seat_number}</div>
                                {seat.is_booked && (
                                    <div className={`text-xs mt-1 ${isDark ? 'text-red-300' : 'text-red-600'}`}>
                                        Booked
                                    </div>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Modals */}
            {/* Booking Confirmation Modal */}
            <Modal
                isOpen={confirmOpen}
                onClose={() => {
                    setConfirmOpen(false);
                    setSelectedSeat(null);
                    setSeatToBook(null);
                }}
                title="Confirm Booking"
                isDark={isDark}
            >
                <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="mb-6">
                        <p className="text-center text-lg">
                            Would you like to book seat{" "}
                            <span className="font-bold text-xl">
                                {seats.find(s => s.id === seatToBook)?.seat_number}
                            </span>?
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setConfirmOpen(false);
                                setSelectedSeat(null);
                                setSeatToBook(null);
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                isDark 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={confirmBooking}
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Cancel Booking Modal */}
            <Modal
                isOpen={cancelOpen}
                onClose={() => {
                    setCancelOpen(false);
                    setSelectedSeat(null);
                    setSeatToCancel(null);
                }}
                title="Cancel Booking"
                isDark={isDark}
            >
                <div className={`${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <div className="mb-6">
                        <div className="flex items-center justify-center mb-4">
                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <p className="text-center text-lg">
                            Cancel booking for seat{" "}
                            <span className="font-bold text-xl">
                                {seats.find(s => s.id === seatToCancel)?.seat_number}
                            </span>?
                        </p>
                        <p className="text-center text-sm mt-2">
                            This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button
                            onClick={() => {
                                setCancelOpen(false);
                                setSelectedSeat(null);
                                setSeatToCancel(null);
                            }}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                isDark 
                                    ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' 
                                    : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                            }`}
                        >
                            Keep Booking
                        </button>
                        <button
                            onClick={handleCancel}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                            Cancel Booking
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Toast Container */}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme={isDark ? "dark" : "light"}
            />
        </div>
    );
};

export default BusSeats;