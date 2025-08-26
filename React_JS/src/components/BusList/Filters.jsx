import React from 'react';

const Filters = ({ searchTerm, setSearchTerm, filterOrigin, setFilterOrigin, filterDestination, setFilterDestination, uniqueOrigins, uniqueDestinations, isDark }) => {
  return (
    <div className={`${isDark ? 'bg-gray-800' : 'bg-white'} p-4 rounded-lg shadow-md mb-6`}>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>Search</label>
          <input
            type="text"
            placeholder="Search buses..."
            className={`w-full px-3 py-2 border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>From</label>
          <select
            className={`w-full px-3 py-2 border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            value={filterOrigin}
            onChange={(e) => setFilterOrigin(e.target.value)}
          >
            <option value="">All Origins</option>
            {uniqueOrigins.map(origin => <option key={origin} value={origin}>{origin}</option>)}
          </select>
        </div>

        <div>
          <label className={`block text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'} mb-1`}>To</label>
          <select
            className={`w-full px-3 py-2 border ${isDark ? 'bg-gray-700 border-gray-600 text-gray-100' : 'border-gray-300 text-gray-900'} rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
            value={filterDestination}
            onChange={(e) => setFilterDestination(e.target.value)}
          >
            <option value="">All Destinations</option>
            {uniqueDestinations.map(destination => <option key={destination} value={destination}>{destination}</option>)}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterOrigin('');
              setFilterDestination('');
            }}
            className={`w-full py-2 px-4 rounded font-medium transition-colors duration-200 ${isDark ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
          >
            Clear Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default Filters;
