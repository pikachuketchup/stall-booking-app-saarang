import React, { useState, useMemo } from 'react';
import MapboxBookingMap from '../components/MapboxBookingMap';
import { getEnrichedStalls, DEFAULT_MAPBOX_TOKEN } from '../utils/stallLocations';

export default function BookingPage({
  username,
  stalls,
  selectedStalls,
  setSelectedStalls,
  onProceedToPayment,
  onRevoke,
  onSwitchUser
}) {
  const mapboxToken = import.meta.env.VITE_MAPBOX_TOKEN || DEFAULT_MAPBOX_TOKEN;

  // Search, filter, and active focused stall
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // 'all' | 'available' | 'selected' | 'mine' | 'booked'
  const [activeStallId, setActiveStallId] = useState(null);

  // Enrich stalls with geospatial coordinates and metadata (fallback to 20 stalls if empty)
  const enrichedStalls = useMemo(() => {
    const rawList = (stalls && stalls.length > 0)
      ? stalls
      : Array.from({ length: 20 }, (_, i) => ({ id: i + 1, status: 'available', booked_by: null }));
    return getEnrichedStalls(rawList);
  }, [stalls]);

  const handleStallClick = (stall) => {
    // 1. Red Box / Booked by others
    if (stall.status === 'booked' && stall.booked_by !== username) {
      alert(`Stall #${stall.id} (${stall.name}) is already booked by ${stall.booked_by}.`);
      return;
    }

    // 2. Green Box / Booked by current user
    if (stall.status === 'booked' && stall.booked_by === username) {
      const confirmRevoke = window.confirm(
        `You have booked Stall #${stall.id} (${stall.name}). Would you like to revoke this booking?`
      );
      if (confirmRevoke) {
        onRevoke(stall.id);
      }
      return;
    }

    // 3. Available stall: toggle selection
    if (stall.status === 'available') {
      if (selectedStalls.includes(stall.id)) {
        setSelectedStalls(selectedStalls.filter(id => id !== stall.id));
      } else {
        setSelectedStalls([...selectedStalls, stall.id]);
      }
    }
  };

  const handlePaymentClick = () => {
    if (selectedStalls.length === 0) {
      alert('Please select at least one stall space on the map to proceed.');
      return;
    }
    onProceedToPayment();
  };

  // Filtered stalls for the list panel
  const filteredStalls = useMemo(() => {
    return enrichedStalls.filter((stall) => {
      // Search matching
      const matchesSearch =
        stall.id.toString().includes(searchTerm) ||
        (stall.name && stall.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (stall.zone && stall.zone.toLowerCase().includes(searchTerm.toLowerCase()));

      if (!matchesSearch) return false;

      // Category matching
      if (filterCategory === 'available') return stall.status === 'available';
      if (filterCategory === 'selected') return selectedStalls.includes(stall.id);
      if (filterCategory === 'mine') return stall.status === 'booked' && stall.booked_by === username;
      if (filterCategory === 'booked') return stall.status === 'booked';

      return true;
    });
  }, [enrichedStalls, searchTerm, filterCategory, selectedStalls, username]);

  // Statistics
  const stats = useMemo(() => {
    const total = enrichedStalls.length;
    const available = enrichedStalls.filter(s => s.status === 'available').length;
    const mine = enrichedStalls.filter(s => s.status === 'booked' && s.booked_by === username).length;
    const bookedOthers = enrichedStalls.filter(s => s.status === 'booked' && s.booked_by !== username).length;
    return { total, available, mine, bookedOthers };
  }, [enrichedStalls, username]);

  // Total selected amount calculation
  const totalAmount = useMemo(() => {
    return selectedStalls.reduce((sum, id) => {
      const stall = enrichedStalls.find(s => s.id === id);
      return sum + (stall?.price || 4000);
    }, 0);
  }, [selectedStalls, enrichedStalls]);

  return (
    <div className="booking-portal-container">
      {/* Top Navigation Bar */}
      <header className="portal-header">
        <div className="header-brand">
          <span className="brand-badge">📍 Map View</span>
          <div className="brand-titles">
            <h1 className="brand-title">Food Stall Booking Portal</h1>
            <span className="brand-subtitle">Saarang Cultural & Food Festival Venue Map</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="user-badge">
            <span className="user-avatar">👤</span>
            <span className="user-name"><strong>{username}</strong></span>
          </div>

          {onSwitchUser && (
            <button
              onClick={onSwitchUser}
              className="btn-token-config"
              title="Switch user account"
            >
              🔄 Switch User
            </button>
          )}
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="portal-body">
        {/* Left/Center Interactive Map View */}
        <main className="map-view-section">
          <MapboxBookingMap
            stalls={enrichedStalls}
            selectedStalls={selectedStalls}
            onStallClick={handleStallClick}
            username={username}
            mapboxToken={mapboxToken}
            activeStallId={activeStallId}
          />
        </main>

        {/* Right Interactive Sidebar & Control Panel */}
        <aside className="portal-sidebar">
          {/* Quick Stats Grid */}
          <div className="sidebar-stats">
            <div className="stat-card">
              <span className="stat-val">{stats.total}</span>
              <span className="stat-lbl">Total Spaces</span>
            </div>
            <div className="stat-card">
              <span className="stat-val text-available">{stats.available}</span>
              <span className="stat-lbl">Available</span>
            </div>
            <div className="stat-card">
              <span className="stat-val text-selected">{selectedStalls.length}</span>
              <span className="stat-lbl">Selected</span>
            </div>
            <div className="stat-card">
              <span className="stat-val text-mine">{stats.mine}</span>
              <span className="stat-lbl">My Bookings</span>
            </div>
          </div>

          {/* Selected Stalls Cart Summary */}
          {selectedStalls.length > 0 && (
            <div className="selected-cart-card">
              <div className="cart-header">
                <h3>Selected Spaces ({selectedStalls.length})</h3>
                <span className="cart-total-price">₹{totalAmount.toLocaleString()}</span>
              </div>
              <div className="cart-tags">
                {selectedStalls.map((id) => {
                  const stall = enrichedStalls.find(s => s.id === id);
                  return (
                    <div key={id} className="cart-tag">
                      <span>Stall #{id}</span>
                      <button
                        onClick={() => setSelectedStalls(selectedStalls.filter(sId => sId !== id))}
                        className="cart-tag-remove"
                        title="Remove selection"
                      >
                        ×
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Primary Action Button */}
          <div className="sidebar-checkout-action">
            <button
              onClick={handlePaymentClick}
              disabled={selectedStalls.length === 0}
              className={`btn-proceed-payment ${selectedStalls.length > 0 ? 'enabled' : 'disabled'}`}
            >
              {selectedStalls.length > 0
                ? `Proceed to Payment (${selectedStalls.length} Stalls • ₹${totalAmount.toLocaleString()})`
                : 'Select Spaces on Map to Book'}
            </button>
          </div>

          {/* Search & Filter Controls */}
          <div className="sidebar-filter-section">
            <div className="search-bar-wrapper">
              <input
                type="text"
                placeholder="Search by stall #, name, zone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="sidebar-search-input"
              />
              {searchTerm && (
                <button className="search-clear-btn" onClick={() => setSearchTerm('')}>×</button>
              )}
            </div>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${filterCategory === 'all' ? 'active' : ''}`}
                onClick={() => setFilterCategory('all')}
              >
                All ({enrichedStalls.length})
              </button>
              <button
                className={`filter-tab ${filterCategory === 'available' ? 'active' : ''}`}
                onClick={() => setFilterCategory('available')}
              >
                Available ({stats.available})
              </button>
              <button
                className={`filter-tab ${filterCategory === 'mine' ? 'active' : ''}`}
                onClick={() => setFilterCategory('mine')}
              >
                Mine ({stats.mine})
              </button>
              <button
                className={`filter-tab ${filterCategory === 'booked' ? 'active' : ''}`}
                onClick={() => setFilterCategory('booked')}
              >
                Booked ({stats.bookedOthers + stats.mine})
              </button>
            </div>
          </div>

          {/* Stalls List */}
          <div className="stalls-list-container">
            {filteredStalls.length === 0 ? (
              <div className="empty-list-msg">No stalls match the selected filters.</div>
            ) : (
              filteredStalls.map((stall) => {
                const isSelected = selectedStalls.includes(stall.id);
                const isMine = stall.status === 'booked' && stall.booked_by === username;
                const isOthers = stall.status === 'booked' && stall.booked_by !== username;

                let cardStatusClass = 'status-available';
                let statusLabel = 'Available';
                if (isMine) {
                  cardStatusClass = 'status-mine';
                  statusLabel = 'Booked by You';
                } else if (isOthers) {
                  cardStatusClass = 'status-others';
                  statusLabel = `Booked (${stall.booked_by})`;
                } else if (isSelected) {
                  cardStatusClass = 'status-selected';
                  statusLabel = 'Selected';
                }

                return (
                  <div
                    key={stall.id}
                    className={`stall-list-card ${cardStatusClass} ${isSelected ? 'is-selected' : ''}`}
                    onClick={() => handleStallClick(stall)}
                  >
                    <div className="card-top-row">
                      <div className="card-title-group">
                        <span className="stall-number-badge">#{stall.id}</span>
                        <strong className="stall-card-name">{stall.name}</strong>
                      </div>
                      <span className={`status-pill ${cardStatusClass}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="card-meta-row">
                      <span className="stall-meta-item">📍 {stall.zone}</span>
                      <span className="stall-meta-item">📐 {stall.size}</span>
                      <span className="stall-meta-item stall-price">₹{(stall.price || 4000).toLocaleString()}</span>
                    </div>

                    <div className="card-actions-row" onClick={(e) => e.stopPropagation()}>
                      <button
                        className="btn-locate-map"
                        onClick={() => setActiveStallId(stall.id)}
                        title="Focus on Map"
                      >
                        🎯 Focus Map
                      </button>

                      {stall.status === 'available' && (
                        <button
                          className={`btn-card-toggle ${isSelected ? 'btn-deselect' : 'btn-select'}`}
                          onClick={() => handleStallClick(stall)}
                        >
                          {isSelected ? 'Remove' : 'Select'}
                        </button>
                      )}

                      {isMine && (
                        <button
                          className="btn-card-revoke"
                          onClick={() => handleStallClick(stall)}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}