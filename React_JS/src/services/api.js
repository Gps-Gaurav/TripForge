import axios from 'axios';

const API_BASE_URL = 'https://tripforge.onrender.com/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API services
export const authService = {
  login: async (username, password) => {
    const response = await api.post('/login/', { username, password });
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/register/', userData);
    return response.data;
  }
};

export const busService = {
    getAllBuses: async () => {
      const response = await api.get('/buses/');
      return response.data;
    },
    
    getBusById: async (busId) => {
      const response = await api.get(`/buses/${busId}/`);
      return response.data;
    }
  };

export const bookingService = {
  createBooking: async (seatId) => {
    const response = await api.post('/booking/', { seat: seatId });
    return response.data;
  },

  getUserBookings: async (userId) => {
    const response = await api.get(`/user/${userId}/bookings/`);
    return response.data;
  },

  cancelBooking: async (bookingId) => {
    const response = await api.post(`/bookings/${bookingId}/cancel/`);
    return response.data;
  }
};

export default api;