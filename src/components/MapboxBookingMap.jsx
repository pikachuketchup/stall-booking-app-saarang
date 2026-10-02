import React, { useEffect, useRef, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  VENUE_CENTER,
  DEFAULT_ZOOM,
  DEFAULT_3D_PITCH,
  DEFAULT_3D_BEARING,
  MAP_STYLES,
  DEFAULT_MAPBOX_TOKEN,
  generateStalls3DGeoJSON,
  generateVenueLandmarks3DGeoJSON,
  generateRedLinePathsGeoJSON
} from '../utils/stallLocations';

export default function MapboxBookingMap({
  stalls = [],
  selectedStalls = [],
  onStallClick,
  username,
  mapboxToken,
  activeStallId
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({});
  const popupRef = useRef(null);
  const orbitAnimRef = useRef(null);

  const [activeStyleKey, setActiveStyleKey] = useState('mapbox-streets');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [is3DMode, setIs3DMode] = useState(true);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const [lightingPreset, setLightingPreset] = useState('day'); // 'day' | 'sunset' | 'night'
  const [pitchValue, setPitchValue] = useState(DEFAULT_3D_PITCH);

  const activeToken = (mapboxToken && mapboxToken.trim()) || DEFAULT_MAPBOX_TOKEN;
  const isValidToken = true;

  // Helper to determine stall status color & info
  const getStallVisuals = useCallback((stall) => {
    const isBooked = stall.status === 'booked';
    const isMine = isBooked && stall.booked_by === username;
    const isOthers = isBooked && stall.booked_by !== username;
    const isSelected = selectedStalls.includes(stall.id);

    if (isMine) {
      return {
        bgColor: '#10b981',
        borderColor: '#047857',
        textColor: '#ffffff',
        label: 'Booked by You',
        badge: '✓ Mine',
        icon: '👤'
      };
    }
    if (isOthers) {
      return {
        bgColor: '#ef4444',
        borderColor: '#b91c1c',
        textColor: '#ffffff',
        label: `Booked by ${stall.booked_by}`,
        badge: 'Booked',
        icon: '🔒'
      };
    }
    if (isSelected) {
      return {
        bgColor: '#f59e0b',
        borderColor: '#b45309',
        textColor: '#1f2937',
        label: 'Selected',
        badge: 'Selected',
        icon: '⭐'
      };
    }
    return {
      bgColor: '#ffffff',
      borderColor: '#0284c7',
      textColor: '#0f172a',
      label: 'Available',
      badge: 'Available',
      icon: '🏪'
    };
  }, [username, selectedStalls]);

  // Add 3D Extruded Layers to Map
  const add3DLayers = useCallback((mapInstance) => {
    if (!mapInstance) return;


    // 1. Red Line Festival Pathways (visual red guidance lines matching drawn promenade)
    const redLinesGeoJSON = generateRedLinePathsGeoJSON();
    if (!mapInstance.getSource('red-lines-source')) {
      mapInstance.addSource('red-lines-source', {
        type: 'geojson',
        data: redLinesGeoJSON
      });

      // Red line soft glow
      mapInstance.addLayer({
        id: 'red-lines-glow',
        type: 'line',
        source: 'red-lines-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#f87171',
          'line-width': 10,
          'line-opacity': 0.45,
          'line-blur': 4
        }
      });

      // Red line crisp demarcated festival pathway
      mapInstance.addLayer({
        id: 'red-lines-core',
        type: 'line',
        source: 'red-lines-source',
        layout: {
          'line-join': 'round',
          'line-cap': 'round'
        },
        paint: {
          'line-color': '#dc2626',
          'line-width': 4.5,
          'line-opacity': 0.95,
          'line-dasharray': [3, 1.5]
        }
      });
    } else {
      mapInstance.getSource('red-lines-source').setData(redLinesGeoJSON);
    }

    // 2. Add Stalls 3D Source & Extrusion Layers
    const stallsGeoJSON = generateStalls3DGeoJSON(stalls, selectedStalls, username);
    if (!mapInstance.getSource('stalls-3d-source')) {
      mapInstance.addSource('stalls-3d-source', {
        type: 'geojson',
        data: stallsGeoJSON
      });

      // 3D Stall Walls / Body
      mapInstance.addLayer({
        id: 'stalls-3d-base',
        type: 'fill-extrusion',
        source: 'stalls-3d-source',
        filter: ['==', ['get', 'part'], 'body'],
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.95,
          'fill-extrusion-vertical-gradient': true
        }
      });

      // 3D Stall Overhanging Canopy Roof
      mapInstance.addLayer({
        id: 'stalls-3d-roof',
        type: 'fill-extrusion',
        source: 'stalls-3d-source',
        filter: ['==', ['get', 'part'], 'roof'],
        paint: {
          'fill-extrusion-color': ['get', 'color'],
          'fill-extrusion-height': ['get', 'height'],
          'fill-extrusion-base': ['get', 'base_height'],
          'fill-extrusion-opacity': 0.98,
          'fill-extrusion-vertical-gradient': true
        }
      });
    } else {
      mapInstance.getSource('stalls-3d-source').setData(stallsGeoJSON);
    }

    // 3. Optional Mapbox Vector Buildings & Terrain (if valid token provided)
    if (isValidToken) {
      // Check for Mapbox composite building source
      if (mapInstance.getSource('composite') && !mapInstance.getLayer('mapbox-3d-buildings')) {
        const layers = mapInstance.getStyle().layers;
        const labelLayerId = layers.find(
          (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
        )?.id;

        mapInstance.addLayer(
          {
            id: 'mapbox-3d-buildings',
            source: 'composite',
            'source-layer': 'building',
            filter: ['==', 'extrude', 'true'],
            type: 'fill-extrusion',
            minzoom: 15,
            paint: {
              'fill-extrusion-color': '#94a3b8',
              'fill-extrusion-height': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'height']
              ],
              'fill-extrusion-base': [
                'interpolate',
                ['linear'],
                ['zoom'],
                15,
                0,
                15.05,
                ['get', 'min_height']
              ],
              'fill-extrusion-opacity': 0.65
            }
          },
          labelLayerId
        );
      }

      // Add 3D Terrain DEM if supported and not yet added
      if (!mapInstance.getSource('mapbox-dem')) {
        try {
          mapInstance.addSource('mapbox-dem', {
            type: 'raster-dem',
            url: 'mapbox://mapbox.mapbox-terrain-dem-v1',
            tileSize: 512,
            maxzoom: 14
          });
          mapInstance.setTerrain({ source: 'mapbox-dem', exaggeration: 1.2 });
        } catch (err) {
          console.warn('Mapbox DEM terrain setup note:', err);
        }
      }
    }
  }, [stalls, selectedStalls, username, isValidToken]);

  // Apply Lighting Presets (Day, Sunset, Night)
  const applyLighting = useCallback((mapInstance, preset) => {
    if (!mapInstance) return;
    let lightConfig;

    if (preset === 'sunset') {
      lightConfig = {
        anchor: 'viewport',
        color: '#fbbf24',
        intensity: 0.65,
        position: [1.8, 130, 25]
      };
    } else if (preset === 'night') {
      lightConfig = {
        anchor: 'viewport',
        color: '#818cf8',
        intensity: 0.38,
        position: [1.2, 45, 60]
      };
    } else {
      // Day
      lightConfig = {
        anchor: 'viewport',
        color: '#ffffff',
        intensity: 0.52,
        position: [1.5, 90, 45]
      };
    }

    try {
      mapInstance.setLight(lightConfig);
    } catch (e) {
      console.warn('Light configuration note:', e);
    }
  }, []);

  // Keep mapbox accessToken in sync if token updates
  useEffect(() => {
    mapboxgl.accessToken = activeToken;
  }, [activeToken]);

  // Initialize Map ONCE on mount
  useEffect(() => {
    if (!mapContainerRef.current) return;

    mapboxgl.accessToken = activeToken;

    const selectedStyleObj = MAP_STYLES.find((s) => s.key === activeStyleKey) || MAP_STYLES[0];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: selectedStyleObj.id,
      center: VENUE_CENTER,
      zoom: DEFAULT_ZOOM,
      pitch: DEFAULT_3D_PITCH,
      bearing: DEFAULT_3D_BEARING,
      antialias: true
    });

    map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new mapboxgl.FullscreenControl(), 'top-right');

    map.on('load', () => {
      map.resize();
      add3DLayers(map);
      applyLighting(map, lightingPreset);
      setMapLoaded(true);
    });

    // Handle Click on 3D Stalls Extrusion directly
    const handle3DStallClick = (e) => {
      if (e.features && e.features.length > 0) {
        const feature = e.features[0];
        const sId = feature.properties.stallId;
        const targetStall = stalls.find((s) => s.id === Number(sId));
        if (targetStall) {
          onStallClick(targetStall);
          showStallPopup(targetStall);
        }
      }
    };

    map.on('click', 'stalls-3d-base', handle3DStallClick);
    map.on('click', 'stalls-3d-roof', handle3DStallClick);

    // Cursor hover effects on 3D extrusions
    map.on('mouseenter', 'stalls-3d-base', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'stalls-3d-base', () => {
      map.getCanvas().style.cursor = '';
    });
    map.on('mouseenter', 'stalls-3d-roof', () => {
      map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'stalls-3d-roof', () => {
      map.getCanvas().style.cursor = '';
    });

    // Stop 3D orbit tour when user interacts with map
    map.on('dragstart', () => {
      if (orbitAnimRef.current) {
        cancelAnimationFrame(orbitAnimRef.current);
        orbitAnimRef.current = null;
        setIsOrbiting(false);
      }
    });

    mapRef.current = map;

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    resizeObserver.observe(mapContainerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (orbitAnimRef.current) {
        cancelAnimationFrame(orbitAnimRef.current);
      }
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []); // Run once on component mount

  // Sync 3D GeoJSON data whenever stalls or selection updates
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;
    const source = map.getSource('stalls-3d-source');
    if (source) {
      source.setData(generateStalls3DGeoJSON(stalls, selectedStalls, username));
    } else {
      add3DLayers(map);
    }
  }, [stalls, selectedStalls, username, mapLoaded, add3DLayers]);

  // Handle Style Switching
  const handleStyleChange = (styleKey) => {
    const targetStyle = MAP_STYLES.find((s) => s.key === styleKey);
    if (!targetStyle) return;

    setActiveStyleKey(styleKey);
    if (mapRef.current) {
      mapRef.current.setStyle(targetStyle.id);
      mapRef.current.once('style.load', () => {
        add3DLayers(mapRef.current);
        applyLighting(mapRef.current, lightingPreset);
        mapRef.current.resize();
      });
    }
  };

  // Toggle 3D Perspective vs 2D Top-Down View
  const handleToggle3D = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    if (is3DMode) {
      // Switch to 2D
      map.easeTo({
        pitch: 0,
        bearing: 0,
        duration: 900
      });
      setIs3DMode(false);
      setPitchValue(0);
    } else {
      // Switch to 3D
      map.easeTo({
        pitch: DEFAULT_3D_PITCH,
        bearing: DEFAULT_3D_BEARING,
        duration: 1000
      });
      setIs3DMode(true);
      setPitchValue(DEFAULT_3D_PITCH);
    }
  };

  // Quick Pitch Preset Setter
  const handleSetPitch = (newPitch) => {
    if (!mapRef.current) return;
    setPitchValue(newPitch);
    setIs3DMode(newPitch > 0);
    mapRef.current.easeTo({
      pitch: newPitch,
      duration: 800
    });
  };

  // 360° Drone Orbit Tour Toggle
  const handleToggleOrbit = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (isOrbiting) {
      if (orbitAnimRef.current) {
        cancelAnimationFrame(orbitAnimRef.current);
        orbitAnimRef.current = null;
      }
      setIsOrbiting(false);
    } else {
      setIsOrbiting(true);
      // Ensure we are in 3D pitch
      if (map.getPitch() < 40) {
        map.setPitch(DEFAULT_3D_PITCH);
        setIs3DMode(true);
      }

      const rotateStep = () => {
        if (!mapRef.current) return;
        const currentBearing = mapRef.current.getBearing();
        mapRef.current.rotateTo((currentBearing + 0.3) % 360, { duration: 0 });
        orbitAnimRef.current = requestAnimationFrame(rotateStep);
      };
      orbitAnimRef.current = requestAnimationFrame(rotateStep);
    }
  };

  // Switch Lighting Preset
  const handleLightingChange = (preset) => {
    setLightingPreset(preset);
    applyLighting(mapRef.current, preset);
  };

  // Show stall popup
  const showStallPopup = useCallback((stall) => {
    if (!mapRef.current) return;
    const map = mapRef.current;
    const visuals = getStallVisuals(stall);

    if (popupRef.current) {
      popupRef.current.remove();
    }

    const isBooked = stall.status === 'booked';
    const isMine = isBooked && stall.booked_by === username;
    const isOthers = isBooked && stall.booked_by !== username;
    const isSelected = selectedStalls.includes(stall.id);

    let actionButtonText = 'Select 3D Space';
    let actionButtonClass = 'map-btn-select';
    if (isSelected) {
      actionButtonText = 'Deselect Space';
      actionButtonClass = 'map-btn-deselect';
    } else if (isMine) {
      actionButtonText = 'Revoke Booking';
      actionButtonClass = 'map-btn-revoke';
    } else if (isOthers) {
      actionButtonText = `Booked by ${stall.booked_by}`;
      actionButtonClass = 'map-btn-disabled';
    }

    const popupContent = document.createElement('div');
    popupContent.className = 'mapbox-stall-popup';
    popupContent.innerHTML = `
      <div class="popup-header" style="border-left: 4px solid ${visuals.borderColor}">
        <span class="popup-zone">${stall.zone || 'Food Zone'}</span>
        <h4>${stall.name || `Stall #${stall.id}`}</h4>
      </div>
      <div class="popup-body">
        <div class="popup-row">
          <span>Status:</span>
          <strong style="color: ${visuals.borderColor}">${visuals.label}</strong>
        </div>
        <div class="popup-row">
          <span>Dimensions:</span>
          <span>${stall.size || '10x10 ft'}</span>
        </div>
        <div class="popup-row">
          <span>Rate:</span>
          <span>₹${(stall.price || 4000).toLocaleString()}/day</span>
        </div>
      </div>
      <div class="popup-footer">
        <button id="popup-action-btn-${stall.id}" class="popup-action-btn ${actionButtonClass}" ${isOthers ? 'disabled' : ''}>
          ${actionButtonText}
        </button>
      </div>
    `;

    const actionBtn = popupContent.querySelector(`#popup-action-btn-${stall.id}`);
    if (actionBtn && !isOthers) {
      actionBtn.addEventListener('click', () => {
        onStallClick(stall);
      });
    }

    const popup = new mapboxgl.Popup({ offset: 35, closeButton: true })
      .setLngLat([stall.lng, stall.lat])
      .setDOMContent(popupContent)
      .addTo(map);

    popupRef.current = popup;
  }, [username, selectedStalls, getStallVisuals, onStallClick]);

  // Update Floating HTML 3D Marker Badges
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const currentStallIds = new Set(stalls.map((s) => s.id));
    Object.keys(markersRef.current).forEach((id) => {
      if (!currentStallIds.has(Number(id))) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    stalls.forEach((stall) => {
      if (!stall.lng || !stall.lat) return;
      const visuals = getStallVisuals(stall);
      let markerObj = markersRef.current[stall.id];

      if (!markerObj) {
        const el = document.createElement('div');
        el.className = 'custom-stall-marker';
        el.id = `marker-stall-${stall.id}`;

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'bottom',
          offset: [0, -12] // Float right above the 3D tent roof
        })
          .setLngLat([stall.lng, stall.lat])
          .addTo(map);

        el.addEventListener('click', (e) => {
          e.stopPropagation();
          onStallClick(stall);
          showStallPopup(stall);
        });

        markersRef.current[stall.id] = marker;
        markerObj = marker;
      }

      const el = markerObj.getElement();
      const isSelected = selectedStalls.includes(stall.id);
      const isMine = stall.status === 'booked' && stall.booked_by === username;

      el.innerHTML = `
        <div class="marker-container ${isSelected ? 'selected' : ''} ${isMine ? 'mine' : ''}" style="
          background-color: ${visuals.bgColor};
          border: 2.5px solid ${visuals.borderColor};
          color: ${visuals.textColor};
        ">
          <div class="marker-icon">${visuals.icon}</div>
          <div class="marker-title">Stall ${stall.id}</div>
          <div class="marker-badge" style="background-color: ${visuals.borderColor}">
            ${visuals.badge}
          </div>
        </div>
        <div class="marker-pin-point" style="border-top-color: ${visuals.borderColor}"></div>
      `;
    });
  }, [stalls, selectedStalls, mapLoaded, getStallVisuals, onStallClick, showStallPopup, username]);

  // Handle active stall flyTo focus with high 3D perspective
  useEffect(() => {
    if (!mapRef.current || !activeStallId) return;
    const target = stalls.find((s) => s.id === activeStallId);
    if (target && target.lng && target.lat) {
      mapRef.current.flyTo({
        center: [target.lng, target.lat],
        zoom: 18.8,
        pitch: 65,
        bearing: -15,
        speed: 1.2,
        curve: 1.4,
        essential: true
      });
      showStallPopup(target);
    }
  }, [activeStallId, stalls, showStallPopup]);

  const handleResetView = () => {
    if (mapRef.current) {
      mapRef.current.flyTo({
        center: VENUE_CENTER,
        zoom: DEFAULT_ZOOM,
        pitch: DEFAULT_3D_PITCH,
        bearing: DEFAULT_3D_BEARING,
        essential: true
      });
      setIs3DMode(true);
      setPitchValue(DEFAULT_3D_PITCH);
    }
  };

  return (
    <div className="mapbox-wrapper">
      {/* Top Floating Map Controls & Style Selector */}
      <div className="map-floating-bar">
        <div className="map-style-selector">
          {MAP_STYLES.map((style) => (
            <button
              key={style.key}
              className={`style-pill ${activeStyleKey === style.key ? 'active' : ''}`}
              onClick={() => handleStyleChange(style.key)}
              title={style.label}
            >
              {style.label}
            </button>
          ))}
        </div>

        <button onClick={handleResetView} className="btn-map-control" title="Reset View to Open Air Theater Food Courts">
          🎯 Center Venue (OAT)
        </button>
      </div>

      {/* 3D Interactive Camera Toolbar (Floating Top-Right) */}
      <div className="map-3d-toolbar">
        {/* 3D vs 2D Perspective Toggle */}
        <button
          onClick={handleToggle3D}
          className={`btn-3d-toggle ${is3DMode ? 'active' : ''}`}
          title="Toggle 3D Perspective Tilt vs 2D Plan View"
        >
          {is3DMode ? '🏢 3D View (62°)' : '🗺️ 2D Flat View'}
        </button>

        {/* 360° Cinematic Drone Orbit */}
        <button
          onClick={handleToggleOrbit}
          className={`btn-orbit-tour ${isOrbiting ? 'orbiting' : ''}`}
          title="Start/Stop 360° Drone Orbit around Festival Venue"
        >
          {isOrbiting ? '⏸️ Stop Orbit' : '🚁 3D Drone Orbit'}
        </button>

        {/* Pitch Angle Presets */}
        <div className="pitch-presets-group">
          <button
            className={`btn-pitch-preset ${pitchValue === 0 ? 'active' : ''}`}
            onClick={() => handleSetPitch(0)}
            title="Top-Down 0°"
          >
            0°
          </button>
          <button
            className={`btn-pitch-preset ${pitchValue === 45 ? 'active' : ''}`}
            onClick={() => handleSetPitch(45)}
            title="Angled 45°"
          >
            45°
          </button>
          <button
            className={`btn-pitch-preset ${pitchValue === 65 ? 'active' : ''}`}
            onClick={() => handleSetPitch(65)}
            title="Dramatic 3D 65°"
          >
            65°
          </button>
        </div>


      </div>

      {/* 3D Mode Live Badge */}
      <div className="map-status-pill">
        <span className="status-live-dot"></span>
        <span className="status-title">📍 Open Air Theater (OAT) • Red Line Festival Promenades (Single Rows)</span>
      </div>

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="mapbox-canvas" />

      {/* Map Bottom Legend */}
      <div className="map-bottom-legend">
        <div className="legend-chip">
          <span className="chip-dot dot-available"></span> Available Stall
        </div>
        <div className="legend-chip">
          <span className="chip-dot dot-selected"></span> Selected ({selectedStalls.length})
        </div>
        <div className="legend-chip">
          <span className="chip-dot dot-mine"></span> Your Booking
        </div>
        <div className="legend-chip">
          <span className="chip-dot dot-others"></span> Booked by Others
        </div>
        <div className="legend-chip landmark-chip">
          <span className="chip-landmark-icon">🎭</span> Open Air Theater (OAT) & Stages
        </div>
      </div>
    </div>
  );
}
