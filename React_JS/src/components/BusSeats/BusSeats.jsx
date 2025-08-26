// components/BusSeats/BusSeats.jsx
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import BusDetails from './BusDetails';
import SeatsGrid from './SeatsGrid';
import BookingModal from './BookingModal';

const BusSeats = ({ token, isDark }) => {
    const { busId } = useParams();
    const navigate = useNavigate();

    const [bus, setBus] = useState(null);
    const [seats, setSeats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedSeat, setSelectedSeat] = useState(null);
    const [bookingModalOpen, setBookingModalOpen] = useState(false);
    const [journeyDate, setJourneyDate] = useState('');

    // Fetch bus & seats
    const fetchBus = async () => {
        if (!token) return navigate('/login');
        try {
            setLoading(true);
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/buses/${busId}`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setBus(response.data);
            setSeats(response.data.seats || []);
            setError(null);
        } catch (err) {
            console.error(err);
            setError('Failed to load bus details. Please try again later.');
            toast.error('Failed to load bus details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchBus(); }, [busId, token]);

    const fetchUpdatedSeats = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/buses/${busId}/`, {
                headers: { 'Authorization': `Token ${token}` }
            });
            setBus(response.data);
            setSeats(response.data.seats || []);
        } catch (err) { console.error(err); toast.error('Failed to refresh seat data'); }
    };

    useEffect(() => { const intervalId = setInterval(fetchUpdatedSeats, 30000); return () => clearInterval(intervalId); }, [busId]);

    const onSeatClick = (seat) => {
        if (!token) return toast.error('Please login to book seats') && navigate('/login');
        if (!seat.is_booked || seat.status === 'cancelled') { setSelectedSeat(seat); setBookingModalOpen(true); }
    };

    const confirmBooking = async () => {
        if (!selectedSeat) return toast.error('Please select a seat first');
        if (!journeyDate) return toast.error('Please select a journey date');
        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL}/booking/`,
                { bus: bus.id, seat: selectedSeat.id, journey_date: journeyDate },
                { headers: { 'Authorization': `Token ${token}` } }
            );
            if (response.status === 201) {
                toast.success('Booking confirmed successfully!');
                setBookingModalOpen(false);
                setSelectedSeat(null);
                setJourneyDate('');
                await fetchUpdatedSeats();
            }
        } catch (err) { console.error(err); toast.error(err.response?.data?.detail || 'Failed to confirm booking'); }
        finally { setLoading(false); }
    };

    if (loading) return <div className="flex justify-center items-center min-h-screen"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div></div>;
    if (error) return <div className={`container mx-auto p-6`}><div className={`p-4 rounded-lg ${isDark ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}><p className="font-medium">{error}</p><button onClick={fetchBus} className={`mt-4 px-4 py-2 rounded ${isDark ? 'bg-red-800 hover:bg-red-700' : 'bg-red-200 hover:bg-red-300'}`}>Try Again</button></div></div>;
    if (!bus) return <div className={`container mx-auto p-6 ${isDark ? 'text-gray-200' : 'text-gray-800'}`}><p>No bus data available.</p></div>;

    return (
        <div className={`container mx-auto p-6 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
            <BusDetails bus={bus} isDark={isDark} />
            <SeatsGrid seats={seats} selectedSeat={selectedSeat} onSeatClick={onSeatClick} isDark={isDark} />
            <BookingModal
                bus={bus}
                selectedSeat={selectedSeat}
                journeyDate={journeyDate}
                setJourneyDate={setJourneyDate}
                confirmBooking={confirmBooking}
                setBookingModalOpen={setBookingModalOpen}
                isDark={isDark}
                loading={loading}
                isOpen={bookingModalOpen}
            />
        </div>

    );
};

export default BusSeats;
