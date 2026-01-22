// components/checkout/PickupStationSelector.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { MapPin, Truck, Clock, ChevronDown, ChevronUp, Search } from 'lucide-react';
import { getCounties, getTownsForCounty, searchCounties, searchTownsInCounty } from '../../data/kenyanLocations';
import { getPickupStationsByLocation } from '../../services/pickupStationApi';

interface PickupStation {
  _id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  operatingHours?: {
    [key: string]: { open: string; close: string };
  };
  capacity?: number;
}

interface LocationSelection {
  county: string;
  town: string;
}

interface PickupStationSelectorProps {
  selectedStation: string;
  onStationSelect: (stationId: string) => void;
  onLocationChange?: (location: LocationSelection) => void;
  disabled?: boolean;
  error?: string;
}

const PickupStationSelector: React.FC<PickupStationSelectorProps> = ({
  selectedStation,
  onStationSelect,
  onLocationChange,
  disabled = false,
  error
}) => {
  // Location state
  const [counties, setCounties] = useState<string[]>([]);
  const [towns, setTowns] = useState<string[]>([]);
  const [filteredCounties, setFilteredCounties] = useState<string[]>([]);
  const [filteredTowns, setFilteredTowns] = useState<string[]>([]);
  
  // Selection state
  const [selectedCounty, setSelectedCounty] = useState('');
  const [selectedTown, setSelectedTown] = useState('');
  
  // Search state
  const [countySearchTerm, setCountySearchTerm] = useState('');
  const [townSearchTerm, setTownSearchTerm] = useState('');
  
  // Dropdown state
  const [showCountyDropdown, setShowCountyDropdown] = useState(false);
  const [showTownDropdown, setShowTownDropdown] = useState(false);
  
  // Pickup stations state
  const [pickupStations, setPickupStations] = useState<PickupStation[]>([]);
  const [loadingStations, setLoadingStations] = useState(false);
  const [stationError, setStationError] = useState('');
  
  // Expanded station details
  const [expandedStation, setExpandedStation] = useState<string | null>(null);

  // Initialize counties on mount
  useEffect(() => {
    const allCounties = getCounties();
    setCounties(allCounties);
    setFilteredCounties(allCounties);
  }, []);

  // Update filtered counties based on search
  useEffect(() => {
    const filtered = searchCounties(countySearchTerm);
    setFilteredCounties(filtered);
  }, [countySearchTerm]);

  // Update towns when county changes
  useEffect(() => {
    if (selectedCounty) {
      const countyTowns = getTownsForCounty(selectedCounty);
      setTowns(countyTowns);
      setFilteredTowns(countyTowns);
      
      // Reset town selection if it's not valid for new county
      if (selectedTown && !countyTowns.includes(selectedTown)) {
        setSelectedTown('');
        setTownSearchTerm('');
      }
    } else {
      setTowns([]);
      setFilteredTowns([]);
      setSelectedTown('');
      setTownSearchTerm('');
    }
  }, [selectedCounty]); // Remove selectedTown from dependencies

  // Update filtered towns based on search
  useEffect(() => {
    if (selectedCounty && townSearchTerm !== undefined) {
      const filtered = searchTownsInCounty(selectedCounty, townSearchTerm);
      setFilteredTowns(filtered);
    }
  }, [townSearchTerm, selectedCounty]);

  // Memoize location to prevent unnecessary re-renders
  const currentLocation = useMemo(() => ({
    county: selectedCounty,
    town: selectedTown
  }), [selectedCounty, selectedTown]);

  // Fetch pickup stations when location is selected
  const fetchPickupStations = useCallback(async (county: string, town: string) => {
    if (!county || !town) return;
    
    setLoadingStations(true);
    setStationError('');
    
    try {
      // Use the actual API endpoint
      const response = await getPickupStationsByLocation(county, town);
      
      if (response.success && response.data.stations) {
        setPickupStations(response.data.stations);
        
        // Auto-select first station if no station is currently selected
        if (response.data.stations.length > 0 && !selectedStation) {
          onStationSelect(response.data.stations[0]._id);
        }
      } else {
        setPickupStations([]);
        setStationError('No pickup stations found for this location');
      }
      
    } catch (error: any) {
      console.error('Error fetching pickup stations:', error);
      setStationError('Failed to load pickup stations for this location');
      setPickupStations([]);
    } finally {
      setLoadingStations(false);
    }
  }, [selectedStation, onStationSelect]); // Include necessary dependencies

  // Effect to fetch stations when location changes
  useEffect(() => {
    if (selectedCounty && selectedTown) {
      fetchPickupStations(selectedCounty, selectedTown);
      
      // Notify parent of location change
      if (onLocationChange) {
        onLocationChange(currentLocation);
      }
    } else {
      setPickupStations([]);
      // Only reset station selection if there's currently one selected
      if (selectedStation) {
        onStationSelect('');
      }
    }
  }, [selectedCounty, selectedTown, fetchPickupStations]); // Remove onLocationChange and onStationSelect

  // Separate effect for location change notification to avoid dependency issues
  useEffect(() => {
    if (onLocationChange && selectedCounty && selectedTown) {
      onLocationChange(currentLocation);
    }
  }, [currentLocation, onLocationChange]);

  const handleCountySelect = useCallback((county: string) => {
    setSelectedCounty(county);
    setCountySearchTerm(county);
    setShowCountyDropdown(false);
    // Station selection will be reset in the useEffect
  }, []);

  const handleTownSelect = useCallback((town: string) => {
    setSelectedTown(town);
    setTownSearchTerm(town);
    setShowTownDropdown(false);
    // Station selection will be reset in the useEffect
  }, []);

  const handleStationSelect = useCallback((stationId: string) => {
    onStationSelect(stationId);
  }, [onStationSelect]);

  const formatOperatingHours = useCallback((hours: any) => {
    if (!hours) return 'Hours not available';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    const todayHours = hours[today];
    
    if (todayHours) {
      return `Today: ${todayHours.open} - ${todayHours.close}`;
    }
    
    return `Mon-Fri: ${hours.monday?.open || '08:00'} - ${hours.monday?.close || '18:00'}`;
  }, []);

  return (
    <div 
  id="pickup-station-section"
  className="bg-white rounded-xl shadow-sm p-6"
>
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <div className="flex items-center space-x-2">
          <Truck className="h-5 w-5 text-orange-600" />
          <h2 className="text-xl font-semibold text-gray-800">
            Pickup Location
          </h2>
        </div>
      </div>

      {/* Location Selection */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Select Your Location</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* County Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              County *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={countySearchTerm}
                onChange={(e) => setCountySearchTerm(e.target.value)}
                onFocus={() => setShowCountyDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowCountyDropdown(false), 200);
                }}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                placeholder="Search and select county"
                disabled={disabled}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {showCountyDropdown ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              {showCountyDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredCounties.map((county) => (
                    <button
                      key={county}
                      type="button"
                      onClick={() => handleCountySelect(county)}
                      className={`w-full text-left px-3 py-2 hover:bg-orange-50 focus:bg-orange-50 transition-colors ${
                        county === selectedCounty ? 'bg-orange-50 text-orange-700' : ''
                      }`}
                    >
                      {county}
                    </button>
                  ))}
                  {filteredCounties.length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No counties found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Town Selector */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Town/Constituency *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={townSearchTerm}
                onChange={(e) => setTownSearchTerm(e.target.value)}
                onFocus={() => setShowTownDropdown(true)}
                onBlur={() => {
                  setTimeout(() => setShowTownDropdown(false), 200);
                }}
                disabled={!selectedCounty || disabled}
                className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                placeholder={selectedCounty ? "Search and select town" : "Select county first"}
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                {showTownDropdown ? (
                  <ChevronUp className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                )}
              </div>
              
              {showTownDropdown && selectedCounty && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredTowns.map((town) => (
                    <button
                      key={town}
                      type="button"
                      onClick={() => handleTownSelect(town)}
                      className={`w-full text-left px-3 py-2 hover:bg-orange-50 focus:bg-orange-50 transition-colors ${
                        town === selectedTown ? 'bg-orange-50 text-orange-700' : ''
                      }`}
                    >
                      {town}
                    </button>
                  ))}
                  {filteredTowns.length === 0 && (
                    <div className="px-3 py-2 text-gray-500 text-sm">
                      No towns found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pickup Stations */}
      {selectedCounty && selectedTown && (
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Available Pickup Stations in {selectedTown}
          </h3>
          
          {loadingStations && (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              <span className="ml-3 text-gray-600">Loading pickup stations...</span>
            </div>
          )}
          
          {stationError && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {stationError}
            </div>
          )}
          
          {!loadingStations && !stationError && pickupStations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-2" />
              <p>No pickup stations available in {selectedTown}, {selectedCounty}</p>
              <p className="text-sm">Please try a different location or contact support</p>
              <button
                onClick={() => fetchPickupStations(selectedCounty, selectedTown)}
                className="mt-2 text-orange-600 hover:text-orange-700 text-sm underline"
              >
                Try Again
              </button>
            </div>
          )}
          
          {!loadingStations && pickupStations.length > 0 && (
            <div className="space-y-3">
              {pickupStations.map((station) => (
                <div
                  key={station._id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedStation === station._id
                      ? 'border-orange-500 bg-orange-50'
                      : 'border-gray-200 hover:border-orange-300'
                  }`}
                  onClick={() => handleStationSelect(station._id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <input
                          type="radio"
                          name="pickupStation"
                          value={station._id}
                          checked={selectedStation === station._id}
                          onChange={() => handleStationSelect(station._id)}
                          className="text-orange-600 focus:ring-orange-500"
                          disabled={disabled}
                        />
                        <h4 className="font-medium text-gray-900">{station.name}</h4>
                      </div>
                      
                      <div className="ml-6 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4" />
                          <span>{station.address}, {station.city}</span>
                        </div>
                        
                        {station.operatingHours && (
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4" />
                            <span>{formatOperatingHours(station.operatingHours)}</span>
                          </div>
                        )}
                      </div>
                      
                      {expandedStation === station._id && (
                        <div className="ml-6 mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {station.phone && (
                              <div>
                                <span className="font-medium">Phone:</span> {station.phone}
                              </div>
                            )}
                            {station.email && (
                              <div>
                                <span className="font-medium">Email:</span> {station.email}
                              </div>
                            )}
                          </div>
                          
                          {station.operatingHours && (
                            <div className="mt-3">
                              <span className="font-medium block mb-2">Operating Hours:</span>
                              <div className="grid grid-cols-2 gap-2 text-xs">
                                {Object.entries(station.operatingHours).map(([day, hours]) => (
                                  <div key={day} className="flex justify-between">
                                    <span className="capitalize">{day}:</span>
                                    <span>{hours.open} - {hours.close}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedStation(
                          expandedStation === station._id ? null : station._id
                        );
                      }}
                      className="ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {expandedStation === station._id ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {!selectedCounty && !selectedTown && (
        <div className="text-center py-8 text-gray-500">
          <MapPin className="h-12 w-12 mx-auto text-gray-300 mb-2" />
          <p>Select your county and town to see available pickup stations</p>
        </div>
      )}
    </div>
  );
};

export default PickupStationSelector;