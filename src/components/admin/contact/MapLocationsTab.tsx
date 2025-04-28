import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Plus, Save, Trash, X } from 'lucide-react';
import React from 'react';
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMapEvents,
} from 'react-leaflet';

// Fix Leaflet marker icon issue
// @ts-expect-error - Known issue with TypeScript and Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl:
        'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icon for locations
const customIcon = new L.Icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/447/447031.png',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -38],
});

type MapLocation = {
    id: number;
    name: string;
    address: string;
    lat: number;
    lng: number;
};

type MapLocationsTabProps = {
    locations: MapLocation[];
    onAddLocation: (location: MapLocation) => void;
    onUpdateLocation: (location: MapLocation) => void;
    onRemoveLocation: (id: number) => void;
};

// Interactive marker component
const LocationMarker = ({
    onSelectLocation,
}: {
    onSelectLocation: (latLng: [number, number]) => void;
}) => {
    useMapEvents({
        click(e) {
            const { lat, lng } = e.latlng;
            onSelectLocation([lat, lng]);
        },
    });

    return null;
};

const MapLocationsTab: React.FC<MapLocationsTabProps> = ({
    locations,
    onAddLocation,
    onUpdateLocation,
    onRemoveLocation,
}) => {
    const [selectedPoint, setSelectedPoint] = React.useState<
        [number, number] | null
    >(null);
    const [newLocationName, setNewLocationName] = React.useState('');
    const [newLocationAddress, setNewLocationAddress] = React.useState('');
    const [editingLocation, setEditingLocation] =
        React.useState<MapLocation | null>(null);
    const [showForm, setShowForm] = React.useState(false);

    const mapStyles = {
        height: '500px',
        width: '100%',
        borderRadius: '0.5rem',
    };

    // Handle map click to set coordinates
    const handleSelectLocation = (latLng: [number, number]) => {
        setSelectedPoint(latLng);
        if (!showForm) {
            setShowForm(true);
        }
    };

    // Add new location
    const handleAddLocation = () => {
        if (!selectedPoint || !newLocationName || !newLocationAddress) return;

        const newLocation: MapLocation = {
            id: Date.now(),
            name: newLocationName,
            address: newLocationAddress,
            lat: selectedPoint[0],
            lng: selectedPoint[1],
        };

        onAddLocation(newLocation);
        resetForm();
    };

    // Update existing location
    const handleUpdateLocation = () => {
        if (!editingLocation || !selectedPoint) return;

        const updatedLocation: MapLocation = {
            ...editingLocation,
            name: newLocationName,
            address: newLocationAddress,
            lat: selectedPoint[0],
            lng: selectedPoint[1],
        };

        onUpdateLocation(updatedLocation);
        resetForm();
    };

    // Set form to edit an existing location
    const startEditingLocation = (location: MapLocation) => {
        setEditingLocation(location);
        setNewLocationName(location.name);
        setNewLocationAddress(location.address);
        setSelectedPoint([location.lat, location.lng]);
        setShowForm(true);
    };

    // Reset the form
    const resetForm = () => {
        setNewLocationName('');
        setNewLocationAddress('');
        setSelectedPoint(null);
        setEditingLocation(null);
        setShowForm(false);
    };

    return (
        <div className="space-y-6 py-4">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center">
                    <MapPin size={20} className="text-primary mr-2" />
                    <h3 className="text-lg font-medium text-gray-900">
                        Map Locations
                    </h3>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark"
                >
                    <Plus size={16} className="mr-1" />
                    {showForm ? 'Hide Form' : 'Add New Location'}
                </button>
            </div>

            <p className="text-sm text-gray-600 mb-2">
                Click on the map to select a location point. You can also click
                on any existing marker to edit it.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                        <div className="map-container" style={mapStyles}>
                            <MapContainer
                                center={[-1.8, 102.7] as [number, number]} // Center of Indonesia
                                zoom={5}
                                style={mapStyles}
                            >
                                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                <LocationMarker
                                    onSelectLocation={handleSelectLocation}
                                />

                                {/* Display existing locations */}
                                {locations.map((location) => (
                                    <Marker
                                        key={location.id}
                                        position={[location.lat, location.lng]}
                                        icon={customIcon}
                                        eventHandlers={{
                                            click: () => {
                                                startEditingLocation(location);
                                            },
                                        }}
                                    >
                                        <Popup>
                                            <div className="p-1">
                                                <h3 className="font-bold text-primary">
                                                    {location.name}
                                                </h3>
                                                <p className="text-sm whitespace-pre-line">
                                                    {location.address}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {location.lat.toFixed(6)},{' '}
                                                    {location.lng.toFixed(6)}
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}

                                {/* Display temporarily selected point */}
                                {selectedPoint && (
                                    <Marker position={selectedPoint}>
                                        <Popup>
                                            <div className="p-1">
                                                <p className="text-xs font-semibold">
                                                    Selected Position
                                                </p>
                                                <p className="text-xs">
                                                    Lat:{' '}
                                                    {selectedPoint[0].toFixed(
                                                        6
                                                    )}
                                                </p>
                                                <p className="text-xs">
                                                    Lng:{' '}
                                                    {selectedPoint[1].toFixed(
                                                        6
                                                    )}
                                                </p>
                                            </div>
                                        </Popup>
                                    </Marker>
                                )}
                            </MapContainer>
                        </div>
                    </div>
                </div>

                {showForm && (
                    <div className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
                        <div className="flex justify-between items-center mb-4">
                            <h4 className="text-md font-medium">
                                {editingLocation
                                    ? 'Edit Location'
                                    : 'Add New Location'}
                            </h4>
                            <button
                                type="button"
                                onClick={resetForm}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Location Name
                                </label>
                                <input
                                    type="text"
                                    value={newLocationName}
                                    onChange={(e) =>
                                        setNewLocationName(e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    placeholder="e.g. Jakarta Office"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    value={newLocationAddress}
                                    onChange={(e) =>
                                        setNewLocationAddress(e.target.value)
                                    }
                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                                    rows={4}
                                    placeholder="Full address"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Coordinates
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Latitude
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                selectedPoint
                                                    ? selectedPoint[0].toFixed(
                                                          6
                                                      )
                                                    : ''
                                            }
                                            disabled
                                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">
                                            Longitude
                                        </label>
                                        <input
                                            type="text"
                                            value={
                                                selectedPoint
                                                    ? selectedPoint[1].toFixed(
                                                          6
                                                      )
                                                    : ''
                                            }
                                            disabled
                                            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="pt-2">
                                {editingLocation ? (
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleUpdateLocation}
                                            disabled={
                                                !selectedPoint ||
                                                !newLocationName ||
                                                !newLocationAddress
                                            }
                                            className="flex-1 inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark disabled:opacity-50"
                                        >
                                            <Save size={16} className="mr-1" />
                                            Update Location
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (editingLocation)
                                                    onRemoveLocation(
                                                        editingLocation.id
                                                    );
                                                resetForm();
                                            }}
                                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-500 hover:bg-red-600"
                                        >
                                            <Trash size={16} className="mr-1" />
                                            Delete
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handleAddLocation}
                                        disabled={
                                            !selectedPoint ||
                                            !newLocationName ||
                                            !newLocationAddress
                                        }
                                        className="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark disabled:opacity-50"
                                    >
                                        <Plus size={16} className="mr-1" />
                                        Add Location
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-6">
                <h3 className="text-md font-medium text-gray-900 mb-3">
                    Current Locations
                </h3>
                {locations.length === 0 ? (
                    <div className="bg-yellow-50 p-4 rounded-md">
                        <p className="text-sm text-yellow-700">
                            No locations added yet. Click the map to add your
                            first location.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {locations.map((location) => (
                            <div
                                key={location.id}
                                className="p-4 border border-gray-200 rounded-md bg-white hover:bg-gray-50 cursor-pointer transition-colors shadow-sm"
                                onClick={() => startEditingLocation(location)}
                            >
                                <div className="flex justify-between">
                                    <h4 className="font-medium text-primary flex items-center">
                                        <MapPin
                                            size={16}
                                            className="mr-1 text-primary"
                                        />
                                        {location.name}
                                    </h4>
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onRemoveLocation(location.id);
                                        }}
                                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                        title="Remove location"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-600 mt-1 whitespace-pre-line">
                                    {location.address}
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    {location.lat.toFixed(6)},{' '}
                                    {location.lng.toFixed(6)}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapLocationsTab;
