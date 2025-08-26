import React from 'react';
import SeatLayout from './SeatLayout';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const BusCard = ({ bus, isDark, token }) => {
  const navigate = useNavigate();

  const handleViewSeats = async () => {
    if (!token) {
      toast.error('Please login to view seats', { toastId: 'login-required' });
      navigate('/login');
      return;
    }

    try {
      await fetch(`${import.meta.env.VITE_API_BASE_URL}/buses/${bus.id}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });
      navigate(`/bus/${bus.id}`);
    } catch (error) {
      console.error('Error fetching bus details:', error);
      toast.error('Failed to load bus details', { toastId: 'bus-detail-error' });
    }
  };

  return (
    <div className={`rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 ${isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'}`}>
      <div className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className={`text-xl font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{bus.bus_name}</h2>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Bus No: {bus.number}</p>
          </div>
          <span className={`${isDark ? 'bg-indigo-900 text-indigo-200' : 'bg-indigo-100 text-indigo-800'} text-xs font-semibold px-2.5 py-0.5 rounded`}>Available</span>
        </div>

        <div className="mt-4">
          <div className={`flex items-center mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{bus.origin} → {bus.destination}</div>
          <div className={`flex items-center mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Depart: {bus.start_time}</div>
          <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Arrive: {bus.reach_time}</div>
        </div>

        <div className="mt-4">
          <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Seat Layout Preview (2+3)</h4>
          <SeatLayout bus={bus} isDark={isDark} />
        </div>

        <div className="mt-6">
          <button
            onClick={handleViewSeats}
            className={`w-full py-2 px-4 rounded font-bold transition-colors duration-300 ${isDark ? 'bg-indigo-500 hover:bg-indigo-600 text-white' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
          >
            View Seats & Book
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusCard;
