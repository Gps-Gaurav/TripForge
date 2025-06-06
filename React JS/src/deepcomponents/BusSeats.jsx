import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTheme } from '../context/ThemeContext'
import { toast, ToastContainer } from 'react-toastify'
import { Dialog } from '@headlessui/react'
import 'react-toastify/dist/ReactToastify.css'

const BusSeats = ({ token }) => {
    const { isDark } = useTheme();
    const [bus, setBus] = useState(null)
    const [seats, setSeats] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)
    const [selectedSeat, setSelectedSeat] = useState(null)
    const [seatToBook, setSeatToBook] = useState(null)
    const [confirmOpen, setConfirmOpen] = useState(false)

    const { busId } = useParams()
    const navigate = useNavigate()

    useEffect(() => {
        const fetchBusDetails = async () => {
            try {
                const response = await axios(`http://localhost:8000/api/buses/${busId}`)
                setBus(response.data)
                setSeats(response.data.seats || [])
            } catch (error) {
                setError('Failed to load bus details. Please try again later.')
            } finally {
                setIsLoading(false)
            }
        }
        fetchBusDetails()
    }, [busId])

    const handleBook = (seatId) => {
        if (!token) {
            toast.error('Please login to book a seat');
            navigate('/login');
            return;
        }
        setSeatToBook(seatId);
        setConfirmOpen(true);
    }

    const confirmBooking = async () => {
        try {
            await axios.post(
                'http://localhost:8000/api/booking/',
                { seat: seatToBook },
                {
                    headers: {
                        Authorization: `Token ${token}`,
                    },
                }
            );
            toast.success('Booking successful!');
            setSelectedSeat(seatToBook);
            setSeats((prevSeats) =>
                prevSeats.map((seat) =>
                    seat.id === seatToBook ? { ...seat, is_booked: true } : seat
                )
            );
            setConfirmOpen(false);
        } catch (error) {
            toast.error(error.response?.data?.error || 'Booking failed. Please try again.');
            if (error.response?.status === 401) navigate('/login');
            setConfirmOpen(false);
        }
    };

    const handleCancel = async (seatId) => {
        const confirmCancel = window.confirm('Are you sure you want to cancel this booking?');
        if (!confirmCancel) return;

        if (!token) {
            toast.error('Please login to cancel a booking');
            navigate('/login');
            return;
        }

        try {
            await axios.delete(`http://localhost:8000/api/booking/${seatId}/`, {
                headers: {
                    Authorization: `Token ${token}`,
                },
            });

            toast.success('Booking cancelled!');
            setSelectedSeat(null);
            setSeats((prevSeats) =>
                prevSeats.map((seat) =>
                    seat.id === seatId ? { ...seat, is_booked: false } : seat
                )
            );
        } catch (error) {
            toast.error(error.response?.data?.error || 'Cancel failed. Try again.');
        }
    };

    const renderSeat = (seat) => {
        const isSelected = selectedSeat === seat.id;

        return (
            <div key={seat.id} className="relative">
                <button
                    onClick={() => {
                        if (seat.is_booked) {
                            if (isSelected) handleCancel(seat.id);
                        } else {
                            handleBook(seat.id);
                        }
                    }}
                    className={`w-14 h-14 sm:w-16 sm:h-16 rounded-md font-medium flex items-center justify-center text-sm shadow-md transition
                        ${seat.is_booked
                            ? isSelected
                                ? 'bg-yellow-400 text-white hover:bg-yellow-500'
                                : 'bg-red-500 text-white cursor-not-allowed'
                            : 'bg-green-500 text-white hover:bg-green-600'}`}
                    disabled={seat.is_booked && !isSelected}
                >
                    {seat.seat_number}
                </button>

                {isSelected && (
                    <span className="absolute -top-1 -right-1 bg-yellow-400 text-xs rounded px-1">
                        ✓
                    </span>
                )}
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className={`flex justify-center items-center min-h-screen ${isDark ? 'text-white' : 'text-black'}`}>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 max-w-xl mx-auto text-center text-red-500">
                {error}
            </div>
        );
    }

    return (
        <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            <ToastContainer />

            {bus && (
                <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md overflow-hidden mb-8`}>
                    <div className="p-6">
                        <h1 className="text-2xl font-bold mb-4">{bus.bus_name}</h1>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Journey Details</h3>
                                <p><strong>Route:</strong> {bus.origin} → {bus.destination}</p>
                                <p><strong>Departure:</strong> {bus.start_time}</p>
                                <p><strong>Arrival:</strong> {bus.reach_time}</p>
                                <p><strong>Bus Number:</strong> {bus.number}</p>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold mb-2">Seat Legend</h3>
                                <div className="flex gap-4">
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 bg-green-500 rounded-sm mr-2" />
                                        <span>Available</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 bg-red-500 rounded-sm mr-2" />
                                        <span>Booked</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-5 h-5 bg-yellow-400 rounded-sm mr-2" />
                                        <span>Yours</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-md p-6`}>
                <h2 className="text-xl font-bold mb-6">Choose Your Seat</h2>

                <div className="overflow-x-auto">
                    <div className="inline-block p-4 border border-gray-300 dark:border-gray-700 rounded-lg">
                        <div className="flex flex-col gap-4">
                            {Array.from({ length: Math.ceil(seats.length / 5) }).map((_, rowIndex) => {
                                const rowSeats = seats.slice(rowIndex * 5, rowIndex * 5 + 5);
                                return (
                                    <div key={rowIndex} className="flex gap-4 justify-center items-center">
                                        <div className="flex gap-4">
                                            {rowSeats.slice(0, 2).map((seat) => renderSeat(seat))}
                                        </div>
                                        <div className="w-6 sm:w-8 md:w-10" />
                                        <div className="flex gap-4">
                                            {rowSeats.slice(2).map((seat) => renderSeat(seat))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                <div className="text-center text-sm text-gray-400 mt-4">🚍 Driver Front</div>
            </div>

            <button
                onClick={() => navigate('/my-bookings')}
                className={`mt-6 px-6 py-2 rounded shadow-sm ${
                    isDark ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : 'bg-indigo-500 hover:bg-indigo-600 text-white'
                }`}
            >
                View Booking Details
            </button>

            {/* Confirmation Dialog */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} className="relative z-50">
                <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Dialog.Panel className={`mx-auto max-w-sm rounded-xl p-6 shadow-lg ${isDark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
                        <Dialog.Title className="text-lg font-semibold mb-4">Confirm Booking</Dialog.Title>
                        <p className="mb-6">
                            Do you want to book seat <strong>{seats.find(s => s.id === seatToBook)?.seat_number}</strong>?
                        </p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setConfirmOpen(false)}
                                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmBooking}
                                className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                Confirm
                            </button>
                        </div>
                    </Dialog.Panel>
                </div>
            </Dialog>
        </div>
    );
};

export default BusSeats;
