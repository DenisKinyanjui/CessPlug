// services/pickupStationApi.ts
import axiosInstance from '../utils/axiosInstance';

export interface PickupStation {
  _id: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  phone?: string;
  email?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  operatingHours?: {
    [key: string]: { open: string; close: string };
  };
  capacity?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PickupStationResponse {
  success: boolean;
  data: {
    stations: PickupStation[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface PickupStationFilters {
  county?: string;
  city?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

// Get pickup stations with optional filters (public endpoint)
export const getPickupStations = async (filters?: PickupStationFilters): Promise<PickupStationResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await axiosInstance.get(`/pickup-stations/all?${params.toString()}`);
  return response.data;
};

// Get pickup stations by location (county and city/town) - public endpoint
export const getPickupStationsByLocation = async (county: string, city: string): Promise<PickupStationResponse> => {
  const response = await axiosInstance.get(`/pickup-stations/location`, {
    params: { county, city }
  });
  return response.data;
};

// Get single pickup station by ID - public endpoint
export const getPickupStationById = async (id: string): Promise<{
  success: boolean;
  data: { station: PickupStation };
  message?: string;
}> => {
  const response = await axiosInstance.get(`/pickup-stations/${id}`);
  return response.data;
};

// Search pickup stations - public endpoint
export const searchPickupStations = async (query: string): Promise<PickupStationResponse> => {
  const response = await axiosInstance.get(`/pickup-stations/search`, {
    params: { q: query }
  });
  return response.data;
};

// Admin function to get pickup stations for admin dashboard
export const getPickupStationsForAdmin = async (): Promise<PickupStationResponse> => {
  const response = await axiosInstance.get('/pickup-stations/admin');
  return response.data;
};

export default {
  getPickupStations,
  getPickupStationsByLocation,
  getPickupStationById,
  searchPickupStations,
  getPickupStationsForAdmin,
};