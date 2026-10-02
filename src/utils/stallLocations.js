// Venue Center: Open Air Theater (OAT) Festival Promenades
export const VENUE_CENTER = [80.23320, 12.98865]; // [lng, lat]
export const DEFAULT_ZOOM = 18.1;
export const DEFAULT_3D_PITCH = 58;
export const DEFAULT_3D_BEARING = -25;

// Layout for 20 stalls total across the 3 pathways
export const STALL_METADATA = {
  // --- LINE 1: North Promenade (10 Stalls) ---
  1: { zone: 'OAT North Promenade', name: 'North Stall #1', size: '10x10 ft', price: 4500, lng: 80.23298, lat: 12.98860 },
  2: { zone: 'OAT North Promenade', name: 'North Stall #2', size: '10x10 ft', price: 4500, lng: 80.23297, lat: 12.98866 },
  3: { zone: 'OAT North Promenade', name: 'North Stall #3', size: '10x10 ft', price: 4500, lng: 80.23297, lat: 12.98872 },
  4: { zone: 'OAT North Promenade', name: 'North Stall #4', size: '10x10 ft', price: 4500, lng: 80.23298, lat: 12.98878 },
  5: { zone: 'OAT North Promenade', name: 'North Stall #5', size: '12x12 ft (Corner)', price: 5500, lng: 80.23301, lat: 12.98884 },
  6: { zone: 'OAT North Promenade', name: 'North Stall #6', size: '10x10 ft', price: 4000, lng: 80.23306, lat: 12.98887 },
  7: { zone: 'OAT North Promenade', name: 'North Stall #7', size: '10x10 ft', price: 4000, lng: 80.23311, lat: 12.98886 },
  8: { zone: 'OAT North Promenade', name: 'North Stall #8', size: '10x10 ft', price: 4000, lng: 80.23316, lat: 12.98883 },
  9: { zone: 'OAT North Promenade', name: 'North Stall #9', size: '10x10 ft', price: 4000, lng: 80.23320, lat: 12.98879 },
  10: { zone: 'OAT North Promenade', name: 'North Stall #10', size: '12x12 ft (Corner)', price: 5000, lng: 80.23323, lat: 12.98874 },

  // --- LINE 2: South East Pathway (5 Stalls) ---
  11: { zone: 'OAT South East Pathway', name: 'South East Stall #11', size: '8x8 ft', price: 3500, lng: 80.23304, lat: 12.98857 },
  12: { zone: 'OAT South East Pathway', name: 'South East Stall #12', size: '8x8 ft', price: 3500, lng: 80.23318, lat: 12.98852 },
  13: { zone: 'OAT South East Pathway', name: 'South East Stall #13', size: '8x8 ft', price: 3500, lng: 80.23332, lat: 12.98846 },
  14: { zone: 'OAT South East Pathway', name: 'South East Stall #14', size: '8x8 ft', price: 3500, lng: 80.23346, lat: 12.98840 },
  15: { zone: 'OAT South East Pathway', name: 'South East Stall #15', size: '10x10 ft', price: 4000, lng: 80.23360, lat: 12.98843 },

  // --- LINE 3: South West Pathway (5 Stalls) ---
  16: { zone: 'OAT South West Pathway', name: 'South West Stall #16', size: '12x12 ft', price: 6000, lng: 80.23298, lat: 12.98838 },
  17: { zone: 'OAT South West Pathway', name: 'South West Stall #17', size: '12x12 ft', price: 6000, lng: 80.23312, lat: 12.98826 },
  18: { zone: 'OAT South West Pathway', name: 'South West Stall #18', size: '15x15 ft (Premium)', price: 7500, lng: 80.23326, lat: 12.98822 },
  19: { zone: 'OAT South West Pathway', name: 'South West Stall #19', size: '12x12 ft', price: 6000, lng: 80.23340, lat: 12.98821 },
  20: { zone: 'OAT South West Pathway', name: 'South West Stall #20', size: '12x12 ft (Premium)', price: 7500, lng: 80.23354, lat: 12.98821 }
};

/**
 * GeoJSON for the Red Line Pathways under the 20 stalls
 */
export function generateRedLinePathsGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 8001,
        properties: {
          name: 'North Festival Promenade Red Line',
          color: '#ef4444'
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [80.23298, 12.98860],
            [80.23297, 12.98866],
            [80.23297, 12.98872],
            [80.23298, 12.98878],
            [80.23301, 12.98884],
            [80.23306, 12.98887],
            [80.23311, 12.98886],
            [80.23316, 12.98883],
            [80.23320, 12.98879],
            [80.23323, 12.98874]
          ]
        }
      },
      {
        type: 'Feature',
        id: 8002,
        properties: {
          name: 'South East Festival Pathway Red Line',
          color: '#ef4444'
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [80.23304, 12.98857],
            [80.23318, 12.98852],
            [80.23332, 12.98846],
            [80.23346, 12.98840],
            [80.23360, 12.98843]
          ]
        }
      },
      {
        type: 'Feature',
        id: 8003,
        properties: {
          name: 'South West Festival Pathway Red Line',
          color: '#ef4444'
        },
        geometry: {
          type: 'LineString',
          coordinates: [
            [80.23298, 12.98838],
            [80.23312, 12.98826],
            [80.23326, 12.98822],
            [80.23340, 12.98821],
            [80.23354, 12.98821]
          ]
        }
      }
    ]
  };
}

/**
 * Returns merged stall object with coordinates and metadata
 */
export function getEnrichedStalls(rawStalls = []) {
  return rawStalls.map((stall, idx) => {
    const meta = STALL_METADATA[stall.id] || generateFallbackCoords(stall.id, idx);
    return {
      ...stall,
      lng: meta.lng,
      lat: meta.lat,
      zone: meta.zone,
      name: meta.name,
      size: stall.size || meta.size,
      price: stall.price || meta.price,
    };
  });
}

function generateFallbackCoords(id, idx) {
  const radius = 0.0007;
  const angle = ((idx || id) * 36) * (Math.PI / 180);
  return {
    zone: 'Festival Outer Zone',
    name: `Festival Stall #${id}`,
    size: '10x10 ft',
    price: 4000,
    lng: VENUE_CENTER[0] + radius * Math.cos(angle),
    lat: VENUE_CENTER[1] + radius * Math.sin(angle),
  };
}

/**
 * Helper to build a rectangular GeoJSON polygon given center [lng, lat] and meter dimensions
 */
function createBoxPolygon(centerLng, centerLat, widthMeters, depthMeters) {
  const dLat = (depthMeters / 2) / 110900;
  const dLng = (widthMeters / 2) / 108300;

  return [
    [centerLng - dLng, centerLat - dLat],
    [centerLng + dLng, centerLat - dLat],
    [centerLng + dLng, centerLat + dLat],
    [centerLng - dLng, centerLat + dLat],
    [centerLng - dLng, centerLat - dLat]
  ];
}

/**
 * Generate 3D Extrusion GeoJSON for all festival stalls
 */
export function generateStalls3DGeoJSON(stalls = [], selectedStalls = [], username = '') {
  const features = [];

  stalls.forEach((stall) => {
    if (!stall.lng || !stall.lat) return;

    let width = 3.6;
    let depth = 3.6;
    if (stall.size && stall.size.includes('15x15')) {
      width = 4.8;
      depth = 4.8;
    } else if (stall.size && stall.size.includes('8x8')) {
      width = 2.8;
      depth = 2.8;
    } else if (stall.size && stall.size.includes('10x10')) {
      width = 3.2;
      depth = 3.2;
    }

    const isBooked = stall.status === 'booked';
    const isMine = isBooked && stall.booked_by === username;
    const isOthers = isBooked && stall.booked_by !== username;
    const isSelected = selectedStalls.includes(stall.id);

    let baseColor = '#0284c7';
    let roofColor = '#38bdf8';
    let statusLabel = 'Available';

    if (isSelected) {
      baseColor = '#f59e0b';
      roofColor = '#fbbf24';
      statusLabel = 'Selected';
    } else if (isMine) {
      baseColor = '#10b981';
      roofColor = '#34d399';
      statusLabel = 'Booked by You';
    } else if (isOthers) {
      baseColor = '#ef4444';
      roofColor = '#f87171';
      statusLabel = `Booked by ${stall.booked_by}`;
    }

    const baseCoords = createBoxPolygon(stall.lng, stall.lat, width, depth);
    const roofCoords = createBoxPolygon(stall.lng, stall.lat, width + 0.6, depth + 0.6);

    // 1. 3D Stall Booth Body
    features.push({
      type: 'Feature',
      id: stall.id,
      geometry: {
        type: 'Polygon',
        coordinates: [baseCoords]
      },
      properties: {
        stallId: stall.id,
        name: stall.name,
        zone: stall.zone,
        price: stall.price,
        size: stall.size,
        status: stall.status,
        booked_by: stall.booked_by,
        statusLabel,
        part: 'body',
        color: baseColor,
        base_height: 0,
        height: isSelected ? 5.2 : 4.2
      }
    });

    // 2. 3D Elevated Canopy Roof
    features.push({
      type: 'Feature',
      id: stall.id + 10000,
      geometry: {
        type: 'Polygon',
        coordinates: [roofCoords]
      },
      properties: {
        stallId: stall.id,
        name: `${stall.name} Canopy`,
        status: stall.status,
        part: 'roof',
        color: roofColor,
        base_height: isSelected ? 5.0 : 4.0,
        height: isSelected ? 6.4 : 5.4
      }
    });
  });

  return {
    type: 'FeatureCollection',
    features
  };
}

/**
 * Generate 3D GeoJSON for Festival Venue Landmarks
 */
export function generateVenueLandmarks3DGeoJSON() {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: 9001,
        geometry: {
          type: 'Polygon',
          coordinates: [createBoxPolygon(80.23364, 12.98896, 22, 16)]
        },
        properties: {
          name: 'Open Air Theater (OAT) Stage & Amphitheatre',
          color: '#312e81',
          base_height: 0,
          height: 3.5
        }
      },
      {
        type: 'Feature',
        id: 9002,
        geometry: {
          type: 'Polygon',
          coordinates: [createBoxPolygon(80.23351, 12.98910, 16, 9)]
        },
        properties: {
          name: 'OAT Facility Building NW',
          color: '#64748b',
          base_height: 0,
          height: 6.0
        }
      },
      {
        type: 'Feature',
        id: 9003,
        geometry: {
          type: 'Polygon',
          coordinates: [createBoxPolygon(80.23378, 12.98883, 18, 10)]
        },
        properties: {
          name: 'OAT Facility Building SE',
          color: '#64748b',
          base_height: 0,
          height: 6.0
        }
      },
      {
        type: 'Feature',
        id: 9004,
        geometry: {
          type: 'Polygon',
          coordinates: [createBoxPolygon(80.23293, 12.98916, 40, 26)]
        },
        properties: {
          name: 'Box 1: North Food Court Arena',
          color: '#e0f2fe',
          base_height: 0,
          height: 0.15
        }
      },
      {
        type: 'Feature',
        id: 9005,
        geometry: {
          type: 'Polygon',
          coordinates: [createBoxPolygon(80.23311, 12.98855, 40, 26)]
        },
        properties: {
          name: 'Box 2: South Food Court Arena',
          color: '#fef3c7',
          base_height: 0,
          height: 0.15
        }
      },
      {
        type: 'Feature',
        id: 9006,
        geometry: {
          type: 'Polygon',
          coordinates: [createBoxPolygon(80.23330, 12.98888, 14, 2.5)]
        },
        properties: {
          name: 'Saarang Food Court Portal Arch',
          color: '#f59e0b',
          base_height: 3.8,
          height: 6.2
        }
      },
      {
        type: 'Feature',
        id: 9007,
        geometry: {
          type: 'Polygon',
          coordinates: [createBoxPolygon(80.23324, 12.98888, 2.2, 2.2)]
        },
        properties: {
          name: 'Portal Column West',
          color: '#b45309',
          base_height: 0,
          height: 6.2
        }
      },
      {
        type: 'Feature',
        id: 9008,
        geometry: {
          type: 'Polygon',
          coordinates: [createBoxPolygon(80.23336, 12.98888, 2.2, 2.2)]
        },
        properties: {
          name: 'Portal Column East',
          color: '#b45309',
          base_height: 0,
          height: 6.2
        }
      }
    ]
  };
}

export const STREETS_STYLE = {
  version: 8,
  sources: {
    'carto-voyager': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-voyager-layer',
      type: 'raster',
      source: 'carto-voyager',
      minzoom: 0,
      maxzoom: 20
    }
  ]
};

export const SATELLITE_STYLE = {
  version: 8,
  sources: {
    'esri-satellite': {
      type: 'raster',
      tiles: [
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
      ],
      tileSize: 256,
      maxzoom: 19,
      attribution: '&copy; Esri, Earthstar Geographics'
    }
  },
  layers: [
    {
      id: 'esri-satellite-layer',
      type: 'raster',
      source: 'esri-satellite'
    }
  ]
};

export const NIGHT_STYLE = {
  version: 8,
  sources: {
    'carto-dark': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-dark-layer',
      type: 'raster',
      source: 'carto-dark',
      minzoom: 0,
      maxzoom: 20
    }
  ]
};

export const LIGHT_STYLE = {
  version: 8,
  sources: {
    'carto-light': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png'
      ],
      tileSize: 256,
      attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
    }
  },
  layers: [
    {
      id: 'carto-light-layer',
      type: 'raster',
      source: 'carto-light',
      minzoom: 0,
      maxzoom: 20
    }
  ]
};

export const DEFAULT_MAPBOX_TOKEN =
  'pk.eyJ1IjoidmlqYXlrcmlzaCIsImEiOiJjbWp5MnJlMG81bXcwM2dxeGpwMWQ2eDFrIn0.5MZuCxCLN1LOieFwJdNrWg';

export const MAP_STYLES = [
  { key: 'mapbox-streets', id: 'mapbox://styles/mapbox/streets-v12', label: '🏙️ 3D Vector Map', requiresToken: false },
  { key: 'satellite', id: SATELLITE_STYLE, label: '🛰️ 3D Satellite', requiresToken: false }
];