import React, { useState, useEffect } from 'react';
import { Search, Database, Shield, Activity, Clock, MapPin, MessageSquare, Hash, RefreshCw, AlertCircle, CheckCircle, TrendingUp, Users, Globe, Lock } from 'lucide-react';

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

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #1e2837 0%, #2d3748 50%, #1a202c 100%)',
      color: '#e2e8f0',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '1.5rem'
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '2rem',
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      padding: '1.5rem'
    },
    filterSection: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    filterGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem'
    },
    filterLabel: {
      fontSize: '0.8rem',
      color: '#a0aec0',
      fontWeight: '500',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    select: {
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '6px',
      color: '#e2e8f0',
      padding: '0.5rem 0.75rem',
      fontSize: '0.9rem',
      minWidth: '140px',
      outline: 'none',
      cursor: 'pointer'
    },
    searchInput: {
      background: 'rgba(255,255,255,0.1)',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '6px',
      color: '#e2e8f0',
      padding: '0.5rem 0.75rem',
      fontSize: '0.9rem',
      width: '250px',
      outline: 'none'
    },
    statsSection: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center'
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.25rem'
    },
    statNumber: {
      fontSize: '1.25rem',
      fontWeight: 'bold',
      color: '#60a5fa'
    },
    statLabel: {
      fontSize: '0.7rem',
      color: '#a0aec0',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      border: 'none',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    },
    primaryButton: {
      background: '#3b82f6',
      color: 'white'
    },
    secondaryButton: {
      background: 'rgba(255,255,255,0.1)',
      color: '#e2e8f0',
      border: '1px solid rgba(255,255,255,0.2)'
    },
    dangerButton: {
      background: 'rgba(239,68,68,0.2)',
      color: '#fca5a5',
      border: '1px solid rgba(239,68,68,0.3)'
    },
    tableContainer: {
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '12px',
      overflow: 'hidden'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse'
    },
    th: {
      background: 'rgba(0,0,0,0.3)',
      padding: '1rem',
      textAlign: 'left',
      borderBottom: '1px solid rgba(255,255,255,0.1)',
      fontSize: '0.8rem',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      color: '#a0aec0'
    },
    td: {
      padding: '1rem',
      borderBottom: '1px solid rgba(255,255,255,0.05)',
      fontSize: '0.9rem'
    },
    badge: {
      display: 'inline-block',
      padding: '0.25rem 0.75rem',
      borderRadius: '12px',
      fontSize: '0.75rem',
      fontWeight: '600'
    },
    errorContainer: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4rem',
      textAlign: 'center'
    },
    errorTitle: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      color: '#ef4444',
      marginBottom: '0.5rem'
    },
    errorMessage: {
      color: '#a0aec0',
      marginBottom: '2rem'
    },
    tryAgainButton: {
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      padding: '0.75rem 1.5rem',
      borderRadius: '6px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }
  };

  const getAccessBadgeStyle = (origin, destination) => {
    const text = `${origin || ''} ${destination || ''}`.toLowerCase();
    if (text.includes('external')) {
      return { ...styles.badge, background: 'rgba(239,68,68,0.2)', color: '#fca5a5' };
    }
    if (text.includes('internal')) {
      return { ...styles.badge, background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' };
    }
    if (text.includes('admin')) {
      return { ...styles.badge, background: 'rgba(139,92,246,0.2)', color: '#c4b5fd' };
    }
    return { ...styles.badge, background: 'rgba(59,130,246,0.2)', color: '#93c5fd' };
  };

  if (error && !loading) {
    return (
        <div style={styles.container}>
          <div style={styles.tableContainer}>
            <div style={styles.errorContainer}>
              <h2 style={styles.errorTitle}>Error loading data</h2>
              <p style={styles.errorMessage}>{error}</p>
              <button style={styles.tryAgainButton} onClick={fetchAccessData}>
                <RefreshCw size={16} />
                Try Again
              </button>
            </div>
          </div>
        </div>
    );
  }

  return (
      <div style={styles.container}>
        {/* Header with Filters and Stats */}
        <div style={styles.header}>
          <div style={styles.filterSection}>
            {/* Time Range Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Time Range Filter</label>
              <select
                  style={styles.select}
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
              >
                <option>Last 1 Hour</option>
                <option>Last 6 Hours</option>
                <option>Last 24 Hours</option>
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>

            {/* Search Messages */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Search Messages</label>
              <input
                  type="text"
                  placeholder="Enter search term..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={styles.searchInput}
              />
            </div>

            {/* Access Origin Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Access Origin Filter</label>
              <select
                  style={styles.select}
                  value={originFilter}
                  onChange={(e) => setOriginFilter(e.target.value)}
              >
                <option>All Origins</option>
                {accessOrigins.map(origin => (
                    <option key={origin} value={origin}>{origin}</option>
                ))}
              </select>
            </div>

            {/* Country Destination Filter */}
            <div style={styles.filterGroup}>
              <label style={styles.filterLabel}>Country Destination</label>
              <select
                  style={styles.select}
                  value={destinationFilter}
                  onChange={(e) => setDestinationFilter(e.target.value)}
              >
                <option>All Countries</option>
                {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stats Section */}
          <div style={styles.statsSection}>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{filteredData.length}</div>
              <div style={styles.statLabel}>Records</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{stats.hours}</div>
              <div style={styles.statLabel}>Hours</div>
            </div>
            <div style={styles.statItem}>
              <div style={styles.statNumber}>{stats.origins}</div>
              <div style={styles.statLabel}>Origins</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
          <button
              style={{...styles.button, ...styles.primaryButton}}
              onClick={fetchAccessData}
              disabled={loading}
          >
            <RefreshCw size={16} style={loading ? {animation: 'spin 1s linear infinite'} : {}} />
            Refresh
          </button>

          <button
              style={{...styles.button, ...styles.secondaryButton}}
              onClick={exportData}
              disabled={filteredData.length === 0}
          >
            <Download size={16} />
            Export
          </button>

          <button
              style={{...styles.button, ...styles.dangerButton}}
              onClick={clearFilters}
          >
            <X size={16} />
            Clear
          </button>
        </div>

        {/* Data Table */}
        <div style={styles.tableContainer}>
          {loading ? (
              <div style={styles.errorContainer}>
                <RefreshCw size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
                <p>Loading access records...</p>
              </div>
          ) : (
              <table style={styles.table}>
                <thead>
                <tr>
                  <th style={styles.th}>ID</th>
                  <th style={styles.th}>Timestamp</th>
                  <th style={styles.th}>Origin</th>
                  <th style={styles.th}>Destination</th>
                  <th style={styles.th}>Message</th>
                </tr>
                </thead>
                <tbody>
                {filteredData.length > 0 ? (
                    filteredData.slice(0, 100).map((entry, index) => (
                        <tr key={entry.id || index} style={{ ':hover': { background: 'rgba(255,255,255,0.03)' } }}>
                          <td style={styles.td}>#{entry.id || 'N/A'}</td>
                          <td style={styles.td}>{formatTimestamp(entry.timestamp)}</td>
                          <td style={styles.td}>
                      <span style={getAccessBadgeStyle(entry.access_origin, entry.access_destination)}>
                        {entry.access_origin || 'Unknown'}
                      </span>
                          </td>
                          <td style={styles.td}>
                      <span style={getAccessBadgeStyle(entry.access_origin, entry.access_destination)}>
                        {entry.access_destination || 'Unknown'}
                      </span>
                          </td>
                          <td style={styles.td}>
                            <div style={{ maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {entry.message || <span style={{ color: '#718096', fontStyle: 'italic' }}>No message</span>}
                            </div>
                          </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                      <td colSpan="5" style={{ ...styles.td, textAlign: 'center', padding: '4rem', color: '#718096' }}>
                        <Database size={48} style={{ margin: '0 auto 1rem', display: 'block', opacity: 0.5 }} />
                        {searchTerm || originFilter !== 'All Origins' || destinationFilter !== 'All Countries'
                            ? 'No matching access entries found'
                            : 'No access entries available'}
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
          )}

          {filteredData.length > 100 && (
              <div style={{ padding: '1rem', textAlign: 'center', background: 'rgba(0,0,0,0.2)', color: '#718096', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                Showing first 100 of {filteredData.length} access entries
              </div>
          )}
        </div>

        <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        select option {
          background: #2d3748;
          color: #e2e8f0;
        }
        
        input::placeholder {
          color: rgba(160, 174, 192, 0.8);
        }
        
        button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }
        
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none !important;
        }
        
        tr:hover {
          background: rgba(255,255,255,0.03) !important;
        }
        
        select:focus, input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
      `}</style>
      </div>
  );
};

export default AccessDashboard;