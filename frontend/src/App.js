import React, { useState, useEffect } from 'react';
import { Search, Database, Shield, Activity, Clock, MapPin, MessageSquare, Hash, RefreshCw, AlertCircle, CheckCircle, TrendingUp, Users, Globe, Lock, Download, X } from 'lucide-react';
import './App.css';

const AccessDashboard = () => {
  const [accessData, setAccessData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeRange, setTimeRange] = useState('Last 1 Hour');
  const [originFilter, setOriginFilter] = useState('All Origins');
  const [destinationFilter, setDestinationFilter] = useState('All Countries');
  const [stats, setStats] = useState({
    total: 0,
    hours: 0,
    origins: 0
  });

  // Dynamic lists loaded from files
  const [accessOrigins, setAccessOrigins] = useState([]);
  const [countries, setCountries] = useState([]);

  const API_BASE = 'http://localhost:3001/api';

  // Load access origins from file
  useEffect(() => {
    const loadAccessOrigins = async () => {
      try {
        const response = await fetch('/Daily_sid_gather.txt');
        if (response.ok) {
          const text = await response.text();
          const origins = text.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
          setAccessOrigins(origins);
        } else {
          console.log('Daily_sid_gather.txt not found, using fallback origins');
          setAccessOrigins(['TikTok', 'WhatsApp', 'Apple', 'Google', 'Microsoft', 'Amazon', 'Facebook', 'Instagram', 'YouTube', 'Telegram']);
        }
      } catch (error) {
        console.error('Error loading access origins:', error);
        setAccessOrigins(['TikTok', 'WhatsApp', 'Apple', 'Google', 'Microsoft', 'Amazon', 'Facebook', 'Instagram', 'YouTube', 'Telegram']);
      }
    };

    loadAccessOrigins();
  }, []);

  // Load countries list from file
  useEffect(() => {
    const loadCountries = async () => {
      try {
        const response = await fetch('/access_destination.txt');
        if (response.ok) {
          const text = await response.text();
          const countryList = text.split('\n')
              .map(line => line.trim())
              .filter(line => line.length > 0);
          setCountries(countryList);
        } else {
          console.log('access_destination.txt not found, using fallback countries');
          setCountries(['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil']);
        }
      } catch (error) {
        console.error('Error loading countries:', error);
        setCountries(['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil']);
      }
    };

    loadCountries();
  }, []);

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await fetch(`${API_BASE}/data/access_entries`);
        if (!response.ok) throw new Error('Failed to fetch access data');

        const data = await response.json();
        setAccessData(data.data || []);
        calculateStats(data.data || []);
      } catch (err) {
        setError('Unable to fetch access data. Please check your connection.');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateStats = (data) => {
    const uniqueOrigins = new Set(
        data.map(entry => entry.access_origin).filter(Boolean)
    ).size;

    setStats({
      total: data.length,
      hours: Math.ceil((Date.now() - new Date(data[0]?.timestamp || Date.now()).getTime()) / (1000 * 60 * 60)) || 1,
      origins: uniqueOrigins
    });
  };

  const fetchAccessData = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch(`${API_BASE}/data/access_entries`);
      if (!response.ok) throw new Error('Failed to fetch access data');

      const data = await response.json();
      setAccessData(data.data || []);
      calculateStats(data.data || []);
    } catch (err) {
      setError('Failed to fetch access records');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = accessData.filter(entry => {
    const matchesSearch = searchTerm === '' ||
        Object.values(entry).some(value =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );

    const matchesOrigin = originFilter === 'All Origins' ||
        (entry.access_origin && entry.access_origin.toLowerCase().includes(originFilter.toLowerCase()));

    const matchesDestination = destinationFilter === 'All Countries' ||
        (entry.access_destination && entry.access_destination.toLowerCase().includes(destinationFilter.toLowerCase()));

    return matchesSearch && matchesOrigin && matchesDestination;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setTimeRange('Last 1 Hour');
    setOriginFilter('All Origins');
    setDestinationFilter('All Countries');
  };

  const exportData = () => {
    const csv = [
      ['ID', 'Timestamp', 'Origin', 'Destination', 'Message'],
      ...filteredData.map(entry => [
        entry.id,
        entry.timestamp,
        entry.access_origin,
        entry.access_destination,
        entry.message
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'access_logs.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleString('en-US', {
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return timestamp;
    }
  };

  const getAccessBadgeStyle = (origin, destination) => {
    const text = `${origin || ''} ${destination || ''}`.toLowerCase();
    if (text.includes('external') || text.includes('threat')) {
      return 'bg-red-500/20 text-red-300 border border-red-500/30';
    }
    if (text.includes('internal') || text.includes('secure')) {
      return 'bg-green-500/20 text-green-300 border border-green-500/30';
    }
    if (text.includes('admin') || text.includes('system')) {
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
    }
    return 'bg-blue-500/20 text-blue-300 border border-blue-500/30';
  };

  if (error && !loading) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-6">
          <div className="glass rounded-xl p-8 text-center max-w-md mx-auto mt-20">
            <AlertCircle size={48} className="mx-auto mb-4 text-red-400" />
            <h2 className="text-xl font-bold text-red-400 mb-2">Connection Error</h2>
            <p className="text-slate-300 mb-6">{error}</p>
            <button
                onClick={fetchAccessData}
                className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        </div>
    );
  }

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white p-6">
        {/* Header */}
        <div className="glass rounded-xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Title and Stats */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-600/20 rounded-lg">
                <Shield size={24} className="text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold gradient-text">SMS Dashboard</h1>
                <p className="text-slate-400">Security Access Monitor</p>
              </div>
            </div>

            {/* Live Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{filteredData.length}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Records</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">{stats.hours}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Hours</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{stats.origins}</div>
                <div className="text-xs text-slate-400 uppercase tracking-wide">Origins</div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="glass rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Time Range */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                <Clock size={14} className="inline mr-1" />
                Time Range
              </label>
              <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>Last 1 Hour</option>
                <option>Last 6 Hours</option>
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                <Search size={14} className="inline mr-1" />
                Search Messages
              </label>
              <input
                  type="text"
                  placeholder="Enter search term..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Origin Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                <Globe size={14} className="inline mr-1" />
                Access Origin
              </label>
              <select
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>All Origins</option>
                {accessOrigins.map(origin => (
                    <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>

            {/* Destination Filter */}
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2 uppercase tracking-wide">
                <MapPin size={14} className="inline mr-1" />
                Destination
              </label>
              <select
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
                  className="w-full bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option>All Countries</option>
                {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
                onClick={fetchAccessData}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>

            <button
                onClick={exportData}
                disabled={filteredData.length === 0}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg transition-colors"
            >
              <Download size={16} />
              Export CSV
            </button>

            <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-lg transition-colors"
            >
              <X size={16} />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="glass rounded-xl overflow-hidden">
          {loading ? (
              <div className="p-12 text-center">
                <RefreshCw size={32} className="animate-spin mx-auto mb-4 text-blue-400" />
                <p className="text-slate-400">Loading access records...</p>
              </div>
          ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-800/50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <Hash size={14} className="inline mr-1" />
                      ID
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <Clock size={14} className="inline mr-1" />
                      Timestamp
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <Globe size={14} className="inline mr-1" />
                      Origin
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <MapPin size={14} className="inline mr-1" />
                      Destination
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                      <MessageSquare size={14} className="inline mr-1" />
                      Message
                    </th>
                  </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                  {filteredData.length > 0 ? (
                      filteredData.slice(0, 100).map((entry, index) => (
                          <tr key={entry.id || index} className="hover:bg-slate-800/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-slate-300">
                              #{entry.id || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                              {formatTimestamp(entry.timestamp)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAccessBadgeStyle(entry.access_origin, entry.access_destination)}`}>
                          {entry.access_origin || 'Unknown'}
                        </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getAccessBadgeStyle(entry.access_origin, entry.access_destination)}`}>
                          {entry.access_destination || 'Unknown'}
                        </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-300">
                              <div className="max-w-xs truncate">
                                {entry.message || <span className="text-slate-500 italic">No message</span>}
                              </div>
                            </td>
                          </tr>
                      ))
                  ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center">
                          <Database size={48} className="mx-auto mb-4 text-slate-600" />
                          <p className="text-slate-400">
                            {searchTerm || originFilter !== 'All Origins' || destinationFilter !== 'All Countries'
                                ? 'No matching access entries found'
                                : 'No access entries available'}
                          </p>
                        </td>
                      </tr>
                  )}
                  </tbody>
                </table>
              </div>
          )}

          {filteredData.length > 100 && (
              <div className="px-6 py-3 bg-slate-800/30 border-t border-slate-700/50 text-center text-sm text-slate-400">
                Showing first 100 of {filteredData.length} access entries
              </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          <p>SMS Dashboard - Security Access Monitor | Last updated: {new Date().toLocaleTimeString()}</p>
        </div>
      </div>
  );
};

export default AccessDashboard;