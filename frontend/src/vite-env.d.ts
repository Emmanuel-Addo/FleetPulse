/// <reference types="vite/client" />

// Leaflet and its marker-cluster plugin ship CSS files without TypeScript
// declarations. Treat stylesheet imports as valid modules in the editor.
declare module '*.css';

declare module 'leaflet' {
  const L: any;
  export default L;
}

declare module 'react-leaflet' {
  export const MapContainer: any;
  export const TileLayer: any;
  export const GeoJSON: any;
  export const useMap: any;
  export const Marker: any;
  export const Popup: any;
}

declare module 'react-leaflet-cluster' {
  const MarkerClusterGroup: any;
  export default MarkerClusterGroup;
}
