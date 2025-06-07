import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { toast } from 'react-toastify';
import { busService } from '../services/api';

const BusList = ({ token }) => {
  const { isDark } = useTheme();
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const navigate = useNavigate();

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Format date time to UTC
  const formatDateTime = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    
    const year = date.getUTCFullYear();
    const month = pad(date.getUTCMonth() + 1);
    const day = pad(date.getUTCDate());
    const hours = pad(date.getUTCHours());
    const minutes = pad(date.getUTCMinutes());
    const seconds = pad(date.getUTCSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // Fetch buses
  useEffect(() => {
    let isMounted = true;

    const fetchBuses = async () => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:8000/api/buses/', {
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json',
          }
        });
        
        if (isMounted) {
          setBuses(response.data);
        }
      } catch (error) {
        console.error('Error fetching buses:', error);
        if (isMounted) {
          setError('Failed to load buses');
          toast.error('Failed to load buses. Please try again later.', {
            toastId: 'fetch-error'
          });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchBuses();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  const renderSeatPreview = (bus) => {
    const totalSeats = bus.total_seats || 50;
    const bookedSeats = new Set(bus.seats?.filter(seat => seat.is_booked).map(seat => seat.seat_number) || []);
    const seatsPerRow = 5;
    const rows = Math.ceil(totalSeats / seatsPerRow);
    const layout = [];

    for (let i = 0; i < rows; i++) {
      const row = [];
      
      // Left side (2 seats)
      for (let j = 0; j < 2; j++) {
        const seatNumber = i * seatsPerRow + j + 1;
        if (seatNumber <= totalSeats) {
          const isBooked = bookedSeats.has(seatNumber);
          row.push(
            <div
              key={`L${seatNumber}`}
              className={`w-4 h-4 rounded-sm m-0.5 transition-colors duration-200 ${
                isBooked
                  ? isDark ? 'bg-red-700' : 'bg-red-500'
                  : isDark ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-400'
              }`}
              title={`Seat ${seatNumber} (${isBooked ? 'Booked' : 'Available'})`}
            />
          );
        }
      }

      // Aisle
      row.push(<div key={`aisle${i}`} className="w-2" />);

      // Right side (3 seats)
      for (let j = 2; j < seatsPerRow; j++) {
        const seatNumber = i * seatsPerRow + j + 1;
        if (seatNumber <= totalSeats) {
          const isBooked = bookedSeats.has(seatNumber);
          row.push(
            <div
              key={`R${seatNumber}`}
              className={`w-4 h-4 rounded-sm m-0.5 transition-colors duration-200 ${
                isBooked
                  ? isDark ? 'bg-red-700' : 'bg-red-500'
                  : isDark ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-400'
              }`}
              title={`Seat ${seatNumber} (${isBooked ? 'Booked' : 'Available'})`}
            />
          );
        }
      }

      layout.push(
        <div key={`row${i}`} className="flex justify-center items-center">
          {row}
        </div>
      );
    }

    const bookedCount = Array.from(bookedSeats).length;

    return (
      <div className="mt-2">
        <div className="flex flex-col gap-1">
          {layout}
        </div>
        <div className={`mt-2 text-center text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          {bookedCount} of {totalSeats} seats booked
        </div>
        <div className="mt-2 flex justify-center gap-4 text-xs">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-green-600' : 'bg-green-500'} mr-1`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Available</span>
          </div>
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-sm ${isDark ? 'bg-red-700' : 'bg-red-500'} mr-1`} />
            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>Booked</span>
          </div>
        </div>
      </div>
    );
  };

  const handleViewSeats = async (busId) => {
    if (!token) {
      toast.error('Please login to view seats', {
        toastId: 'login-required'
      });
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`http://localhost:8000/api/buses/${busId}`, {
        headers: {
          'Authorization': `Token ${token}`,
          'Content-Type': 'application/json',
        }
      });
      navigate(`/bus/${busId}`);
    } catch (error) {
      console.error('Error fetching bus details:', error);
      toast.error('Failed to load bus details', {
        toastId: 'bus-detail-error'
      });
    }
  };

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.bus_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigin = filterOrigin ? bus.origin.toLowerCase() === filterOrigin.toLowerCase() : true;
    const matchesDestination = filterDestination ? bus.destination.toLowerCase() === filterDestination.toLowerCase() : true;
    return matchesSearch && matchesOrigin && matchesDestination;
  });

  const uniqueOrigins = [...new Set(buses.map(bus => bus.origin))];
  const uniqueDestinations = [...new Set(buses.map(bus => bus.destination))];

  if (isLoading) {
    return (
      <div className={`flex justify-center items-center min-h-[400px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-4xl mx-auto">
        <div className={`${isDark ? 'bg-red-900 text-red-100' : 'bg-red-100 text-red-700'} 
          border border-red-400 px-4 py-3 rounded relative`} role="alert">
          <strong className="font-bold">Error! </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => window.location.reload()}
            className={`mt-3 px-4 py-2 rounded ${
              isDark 
                ? 'bg-red-800 hover:bg-red-700' 
                : 'bg-red-200 hover:bg-red-300'
            } transition-colors duration-200`}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
      {/* Date Time Display */}
      <div className={`text-center mb-4 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        Current Date and Time (UTC): {formatDateTime(currentDateTime)}
      </div>

      <h1 className={`text-3xl font-bold mb-8 text-center ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
        Available Buses
      </h1>

      {/* Filters */}
      <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              Search
            </label>
            <input
              type="text"
              placeholder="Search buses..."
              className={`w-full px-3 py-2 border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-100' 
                  : 'border-gray-300 text-gray-900'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              From
            </label>
            <select
              className={`w-full px-3 py-2 border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-100' 
                  : 'border-gray-300 text-gray-900'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
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
            <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>
              To
            </label>
            <select
              className={`w-full px-3 py-2 border ${
                isDark 
                  ? 'bg-gray-700 border-gray-600 text-gray-100' 
                  : 'border-gray-300 text-gray-900'
              } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
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
                setSearchTerm('');
                setFilterOrigin('');
                setFilterDestination('');
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

      {/* Bus List */}
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
                {/* Bus Details */}
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

                {/* Route and Time Details */}
                <div className="mt-4">
                  <div className={`flex items-center mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{bus.origin} → {bus.destination}</span>
                  </div>

                  <div className={`flex items-center mb-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Depart: {bus.start_time}</span>
                  </div>

                  <div className={`flex items-center ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Arrive: {bus.reach_time}</span>
                  </div>
                </div>

                {/* Seat Layout */}
                <div className="mt-4">
                  <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Seat Layout Preview (2+3)
                  </h4>
                  {renderSeatPreview(bus)}
                </div>

                {/* Book Button */}
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
  );
};

export default BusList;