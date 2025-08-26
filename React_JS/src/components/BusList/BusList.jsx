import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';
import BusCard from './BusCard';
import Filters from './Filters';

const BusList = ({ token }) => {
  const { isDark } = useTheme();
  const [buses, setBuses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterOrigin, setFilterOrigin] = useState('');
  const [filterDestination, setFilterDestination] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate('/login');
    let isMounted = true;

    const fetchBuses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/buses/`, {
          headers: { 'Authorization': `Token ${token}` }
        });
        if (isMounted) setBuses(response.data);
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError('Failed to load buses');
          toast.error('Failed to load buses');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    fetchBuses();
    return () => { isMounted = false; };
  }, [token, navigate]);

  const filteredBuses = buses.filter(bus => {
    const matchesSearch = bus.bus_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bus.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesOrigin = filterOrigin ? bus.origin.toLowerCase() === filterOrigin.toLowerCase() : true;
    const matchesDestination = filterDestination ? bus.destination.toLowerCase() === filterDestination.toLowerCase() : true;
    return matchesSearch && matchesOrigin && matchesDestination;
  });

  const uniqueOrigins = [...new Set(buses.map(bus => bus.origin))];
  const uniqueDestinations = [...new Set(buses.map(bus => bus.destination))];

  if (isLoading) return <div className={`flex justify-center items-center min-h-[400px] ${isDark ? 'text-gray-200' : 'text-gray-800'}`}><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500" /></div>;
  if (error) return <div className="p-4 max-w-4xl mx-auto text-center">{error}</div>;

  return (
    <div className={`container mx-auto px-4 py-8 ${isDark ? 'text-gray-100' : 'text-gray-900'}`}>
      <h1 className={`text-3xl font-bold mb-8 text-center ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>Available Buses</h1>
      <Filters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterOrigin={filterOrigin}
        setFilterOrigin={setFilterOrigin}
        filterDestination={filterDestination}
        setFilterDestination={setFilterDestination}
        uniqueOrigins={uniqueOrigins}
        uniqueDestinations={uniqueDestinations}
        isDark={isDark}
      />
      {filteredBuses.length === 0 ? (
        <div className="text-center py-12">
          <h3 className={`text-lg font-medium ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>No buses found</h3>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBuses.map(bus => <BusCard key={bus.id} bus={bus} isDark={isDark} token={token} />)}
        </div>
      )}
    </div>
  );
};

export default BusList;
