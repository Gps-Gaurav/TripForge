import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Custom Modal Component
const Modal = ({ isOpen, onClose, title, children, isDark }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen p-4">
                {/* Backdrop */}
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

                {/* Modal Panel */}
                <div className={`relative ${
                    isDark ? 'bg-gray-800' : 'bg-white'
                } rounded-xl shadow-xl w-full max-w-md mx-auto p-6`}>
                    <div className="absolute right-4 top-4">
                        <button
                            onClick={onClose}
                            className={`${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-600'}`}
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <h3 className={`text-xl font-semibold mb-4 pr-8 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </h3>
                    {children}
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
    const [currentDateTime, setCurrentDateTime] = useState('2025-06-06 11:45:53');
    const [username] = useState('Gps-Gaurav');

    const { busId } = useParams();
    const navigate = useNavigate();

    // Fetch bus details
    useEffect(() => {
        const fetchBusDetails = async () => {
            try {
                const response = await axios(`http://localhost:8000/api/buses/${busId}`);
                setBus(response.data);
                setSeats(response.data.seats || []);
            } catch (error) {
                console.error('Error fetching bus details:', error);
                setError('Failed to load bus details. Please try again later.');
            } finally {
                setIsLoading(false);
            }
        };
        fetchBusDetails();
    }, [busId]);

    // Update time every second (in real implementation)
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentDateTime(now.toISOString().slice(0, 19).replace('T', ' '));
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Handle seat selection
    const handleSeatSelect = (seat) => {
        if (!token) {
            toast.error('Please login to proceed');
            navigate('/login');
            return;
        }

        setSelectedSeat(seat.id);
        if (seat.is_booked) {
            setSeatToCancel(seat.id);
            setCancelOpen(true);
        } else {
            setSeatToBook(seat.id);
            setConfirmOpen(true);
        }
    };

    // Handle booking confirmation
    const handleBookConfirm = async () => {
        try {
            await axios.post(
                'http://localhost:8000/api/booking/',
                { seat: seatToBook },
                { headers: { Authorization: `Token ${token}` } }
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

    // Handle booking cancellation
    const handleCancelConfirm = async () => {
        try {
            await axios.delete(
                `http://localhost:8000/api/booking/${seatToCancel}/`,
                { headers: { Authorization: `Token ${token}` } }
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

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-4xl mx-auto">
                <div className={`${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'} 
                    border border-red-400 px-4 py-3 rounded relative`}>
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            {/* DateTime and User Info Banner */}
            <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
                <div className="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
                    <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{currentDateTime} UTC</span>
                    </div>
                    <div className={`flex items-center space-x-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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

            {/* Seat Selection */}
            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
                <h2 className="text-2xl font-bold mb-6">Select Your Seat</h2>

                {/* Legend */}
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

                {/* Seats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {seats.map((seat) => (
                        <button
                            key={seat.id}
                            onClick={() => handleSeatSelect(seat)}
                            className={`relative p-4 rounded-lg transition-colors duration-200 ${
                                seat.id === selectedSeat
                                    ? isDark ? 'bg-yellow-600' : 'bg-yellow-100'
                                    : seat.is_booked 
                                        ? isDark ? 'bg-red-900' : 'bg-red-100'
                                        : isDark ? 'bg-green-700 hover:bg-green-600' : 'bg-green-100 hover:bg-green-200'
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

            {/* Booking Modal */}
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
                    <div className="flex justify-end space-x-3">
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
                            onClick={handleBookConfirm}
                            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
                        >
                            Confirm Booking
                        </button>
                    </div>
                </div>
            </Modal>

            {/* Cancel Modal */}
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
                            Are you sure you want to cancel seat{" "}
                            <span className="font-bold text-xl">
                                {seats.find(s => s.id === seatToCancel)?.seat_number}
                            </span>?
                        </p>
                        <p className="text-center text-sm mt-2">
                            This action cannot be undone.
                        </p>
                    </div>
                    <div className="flex justify-end space-x-3">
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
                            onClick={handleCancelConfirm}
                            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                        >
                            Cancel Booking
                        </button>
                    </div>
                </div>
            </Modal>

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