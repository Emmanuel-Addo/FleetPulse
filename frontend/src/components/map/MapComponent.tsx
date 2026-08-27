import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, GeoJSON, useMap, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { Loader2, Globe } from 'lucide-react';
import { useFleet } from '../../context/FleetContext';
import { FLEET_ASSETS } from '../../assets/assets';

const EMPTY_GIF = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: EMPTY_GIF,
    iconRetinaUrl: EMPTY_GIF,
    shadowUrl: EMPTY_GIF,
    iconSize: [0, 0],
    shadowSize: [0, 0],
});

interface MapControllerProps {
  bounds: any;
  region: any;
  zoomCommand: any;
  mapCommand: any;
}

function MapController({ bounds, region, zoomCommand, mapCommand }: MapControllerProps) {
    const map = useMap();
    const nationalCenterRef = useRef<L.LatLngTuple>([7.9465, -1.0232]);

    // No forced flyTo on mount — map starts at world view

    useEffect(() => {
        if (!bounds || bounds.length !== 2) return;
        if (!region) {
            const centerLat = (bounds[0][0] + bounds[1][0]) / 2;
            const centerLng = (bounds[0][1] + bounds[1][1]) / 2;
            nationalCenterRef.current = [centerLat, centerLng];
            map.flyTo([centerLat, centerLng], 5, { duration: 1.5, easeLinearity: 0.25 });
        } else {
            map.flyToBounds(bounds, { duration: 1.5, easeLinearity: 0.25 });
        }
    }, [bounds, region, map]);

    useEffect(() => {
        if (!zoomCommand) return;
        if (zoomCommand.type === 'in') map.zoomIn();
        else if (zoomCommand.type === 'out') map.zoomOut();
    }, [zoomCommand, map]);

    useEffect(() => {
        if (!mapCommand) return;
        if (mapCommand.type === 'reset') {
            map.flyTo([7.9465, -1.0232], 5, { duration: 1.8, easeLinearity: 0.25 });
        } else if (mapCommand.type === 'flyTo') {
            map.flyTo([mapCommand.lat, mapCommand.lng], mapCommand.zoom ?? 12, { duration: 1.5, easeLinearity: 0.25 });
        }
    }, [mapCommand, map]);

    return null;
}

interface HoverLayerProps {
  data: any;
}

function HoverLayer({ data }: HoverLayerProps) {
    const map = useMap();
    return (
        <GeoJSON
            data={data}
            style={() => ({ stroke: false, fillOpacity: 0.001, className: 'cursor-pointer' } as any)}
            onEachFeature={(feature, layer: any) => {
                const name = feature.properties?.DISTRICTS || feature.properties?.REGIONS || '';
                if (!name) return;

                layer.bindTooltip(name, {
                    sticky: true,
                    permanent: false,
                    className: 'district-tooltip',
                    direction: 'top',
                    offset: [0, -4],
                });

                let idleTimer: any = null;

                const resetTimer = () => {
                    if (idleTimer) clearTimeout(idleTimer);
                    idleTimer = setTimeout(() => layer.closeTooltip(), 1200);
                };

                layer.on('mousemove', () => {
                    if (!layer.isTooltipOpen()) layer.openTooltip();
                    resetTimer();
                });

                layer.on('mouseout', () => {
                    if (idleTimer) clearTimeout(idleTimer);
                    layer.closeTooltip();
                });

                layer.on('click', () => {
                    map.flyToBounds(layer.getBounds(), { duration: 1.2, easeLinearity: 0.25, padding: [40, 40] });
                });
            }}
        />
    );
}

interface MapComponentProps {
  year?: any;
  region?: any;
  district?: any;
  activeLayers?: string[];
  zoomCommand?: any;
  mapCommand?: any;
  basemap?: string;
  ndviOpacity?: number;
  selectedAssetId?: string | null;
  onSelectAsset?: (asset: any) => void;
}

export default function MapComponent({
    year,
    region,
    district,
    activeLayers = [],
    zoomCommand,
    mapCommand,
    basemap = 'osm',
    ndviOpacity = 1,
    selectedAssetId,
    onSelectAsset,
}: MapComponentProps) {
    const [layers, setLayers] = useState<any>({ ndvi: null, region: null, district: null });
    const [prevLayers, setPrevLayers] = useState<any>(null);
    const [fetchedFilters, setFetchedFilters] = useState<any>({ year: null, region: null, district: null });
    const [bounds, setBounds] = useState<any>(null);
    const [hoverGeoJSON, setHoverGeoJSON] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const clearPrevLayersTimeoutRef = useRef<any>(null);
    const latestLayersRef = useRef(layers);

    useEffect(() => {
        latestLayersRef.current = layers;
    }, [layers]);
    const { state } = useFleet();

    useEffect(() => {
        // Disabled GEE layer fetching because there is no backend API configured for this project.
    }, [year, region, district]);

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={[20, 0]}
                zoom={3}
                minZoom={2}
                maxZoom={18}
                zoomSnap={0.5}
                className="h-full w-full"
                zoomControl={false}
                worldCopyJump={true}
            >
                <BasemapLayer type={basemap} />

                {/* Static Ghana fleet assets — always visible, clearly in Ghana */}
                {FLEET_ASSETS.map(asset => {
                    const isSelected = asset.id === selectedAssetId;
                    const color =
                        asset.status === 'Active'      ? '#10b981' :
                        asset.status === 'Maintenance' ? '#f59e0b' :
                        asset.status === 'Offline'     ? '#ef4444' : '#9ca3af';
                    return (
                        <Marker
                            key={`static-${asset.id}`}
                            position={[asset.lat, asset.lng]}
                            icon={L.divIcon({
                                className: 'bg-transparent',
                                html: `
                                    <div style="
                                        width:${isSelected ? 24 : 18}px;
                                        height:${isSelected ? 24 : 18}px;
                                        background:${color};
                                        border:3px solid white;
                                        border-radius:50%;
                                        box-shadow:0 0 0 2px ${color}, 0 2px 8px rgba(0,0,0,0.35);
                                    "></div>
                                `,
                                iconSize: isSelected ? [24, 24] : [18, 18],
                                iconAnchor: isSelected ? [12, 12] : [9, 9],
                            })}
                            zIndexOffset={1000}
                        >
                            <Popup className="rounded-xl overflow-hidden shadow-xl border-0">
                                <div className="p-3 bg-white min-w-[210px]">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div style={{ width:10, height:10, borderRadius:'50%', background:color }} />
                                        <h4 className="font-bold text-gray-900 text-sm">{asset.name}</h4>
                                        <span style={{ marginLeft:'auto', fontSize:'10px', fontWeight:600, padding:'2px 6px', borderRadius:'6px', background: color+'22', color }}>{asset.status}</span>
                                    </div>
                                    <div className="space-y-1 text-xs text-gray-600">
                                        <div className="flex justify-between"><span>Driver</span><span className="font-semibold text-gray-900">{asset.driverName}</span></div>
                                        <div className="flex justify-between"><span>Battery</span><span className="font-semibold text-gray-900">{asset.battery}%</span></div>
                                        <div className="flex justify-between"><span>Speed</span><span className="font-semibold text-gray-900">{asset.speed} km/h</span></div>
                                        <div className="flex justify-between"><span>Type</span><span className="font-semibold text-gray-900">{asset.type}</span></div>
                                    </div>
                                    {onSelectAsset && (
                                        <button
                                            onClick={() => onSelectAsset(asset)}
                                            className="mt-3 w-full text-xs font-semibold text-white bg-gray-900 hover:bg-gray-700 py-1.5 rounded-lg transition"
                                        >
                                            Focus vehicle
                                        </button>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}

                {layers.ndvi && activeLayers.includes('ndvi') && fetchedFilters.year === year && (
                    <TileLayer url={layers.ndvi} opacity={ndviOpacity} zIndex={10} />
                )}
                {layers.region && activeLayers.includes('region') && fetchedFilters.region === region && (
                    <TileLayer url={layers.region} zIndex={30} />
                )}
                {layers.district && activeLayers.includes('district') && fetchedFilters.district === district && (
                    <TileLayer url={layers.district} zIndex={40} />
                )}

                {prevLayers && (
                    <>
                        {prevLayers.ndvi && activeLayers.includes('ndvi') && <TileLayer url={prevLayers.ndvi} opacity={0.3} zIndex={9} />}
                        {prevLayers.region && activeLayers.includes('region') && <TileLayer url={prevLayers.region} opacity={0.3} zIndex={29} />}
                        {prevLayers.district && activeLayers.includes('district') && <TileLayer url={prevLayers.district} opacity={0.3} zIndex={39} />}
                    </>
                )}

                {hoverGeoJSON && (
                    <HoverLayer
                        key={`${fetchedFilters.region}-${fetchedFilters.district}`}
                        data={hoverGeoJSON}
                    />
                )}

                <MapController bounds={bounds} region={region} zoomCommand={zoomCommand} mapCommand={mapCommand} />
            </MapContainer>

            {loading && (
                <div className="absolute inset-0 z-[400] flex flex-col items-center justify-center bg-black/35 backdrop-blur-[2px]">
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-neutral-800 bg-neutral-950/90 px-6 py-5 shadow-2xl text-center">
                        <div className="relative flex items-center justify-center h-12 w-12 rounded-xl bg-neutral-900 border border-neutral-800">
                            <Globe className="h-6 w-6 text-neutral-400 animate-pulse" />
                            <Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-white opacity-40" strokeWidth={1.5} />
                        </div>
                        <div>
                            <p className="text-[11px] font-bold uppercase tracking-wider text-white">Retrieving Satellite Data</p>
                            <p className="mt-1 text-[9px] text-neutral-400">Processing Sentinel-2 GEE layers...</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

interface BasemapLayerProps {
  type: string;
}

function BasemapLayer({ type }: BasemapLayerProps) {
    switch (type) {
        case 'satellite':
            return (
                <TileLayer
                    url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    attribution='&copy; <a href="https://www.esri.com/">Esri</a>'
                />
            );
        case 'osm':
            return (
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
            );
        case 'dark':
        default:
            return (
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
            );
    }
}
