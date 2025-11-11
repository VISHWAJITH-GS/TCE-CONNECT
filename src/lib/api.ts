/**
 * Centralized API Client
 * Axios instance with authentication and interceptors
 */

import axios, { AxiosError } from "axios";

// API Base URL - Update this for production
const API_BASE_URL = "http://localhost:5000/api";

// Create Axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("tce_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle common errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// ==================== HELPER METHODS ====================

/**
 * GET request
 */
export const get = async <T>(url: string, params?: any): Promise<T> => {
  const response = await api.get<T>(url, { params });
  return response.data;
};

/**
 * POST request
 */
export const post = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.post<T>(url, data);
  return response.data;
};

/**
 * PUT request
 */
export const put = async <T>(url: string, data?: any): Promise<T> => {
  const response = await api.put<T>(url, data);
  return response.data;
};

/**
 * DELETE request
 */
export const del = async <T>(url: string): Promise<T> => {
  const response = await api.delete<T>(url);
  return response.data;
};

// ==================== TYPE DEFINITIONS ====================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    user_id: string;
    email: string;
    full_name: string;
    role: string;
    department?: string;
    year?: number;
    reg_number?: string;
  };
}

export interface Event {
  event_id: string;
  event_name: string;
  date_time: string;
  venue: string;
  about_event: string;
  event_highlights?: string[];
  requirements?: string[];
  available_seats: number;
  registration_fee?: number;
  category?: string;
  department?: string;
  gform_link?: string;
  manager_id: string;
  event_organizers?: Array<{
    id: string;
    organizer_name: string;
    organizer_phone: string;
  }>;
}

export interface Registration {
  registration_id: string;
  event_id: string;
  event_name: string;
  date_time: string;
  venue: string;
  about_event?: string;
  category?: string;
  registered_at: string;
}

export interface Profile {
  user_id: string;
  email: string;
  full_name: string;
  reg_number?: string;
  department?: string;
  year?: number;
  phone_number?: string;
  role: string;
}

export interface ProfileStats {
  role: string;
  stats: {
    // Student stats
    total_registered_events?: number;
    upcoming_events?: number;
    past_events?: number;
    // Organizer stats
    total_events_managed?: number;
    active_events?: number;
    total_registrations_received?: number;
    success_rate?: number;
  };
}

export interface ProfileOverview {
  profile: Profile;
  registered_events: Registration[];
  organized_events?: Array<Event & { total_registrations: number }>;
}

// ==================== AUTH UTILITIES ====================

export const getToken = (): string | null => {
  return localStorage.getItem("tce_token");
};

export const getUserRole = (): string | null => {
  return localStorage.getItem("tce_role");
};

export const getUserId = (): string | null => {
  return localStorage.getItem("tce_user_id");
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export const logout = (): void => {
  // ✅ Remove all auth data
  localStorage.removeItem("tce_token");
  localStorage.removeItem("tce_role");
  localStorage.removeItem("tce_user_id");
  localStorage.removeItem("tce_user");
  
  // ✅ Redirect to login
  window.location.href = "/login";
};

export const setAuthData = (token: string, user: any): void => {
  localStorage.setItem("tce_token", token);
  localStorage.setItem("tce_role", user.role);
  localStorage.setItem("tce_user_id", user.user_id);
  localStorage.setItem("tce_user", JSON.stringify(user));
};

export const getStoredUser = (): any => {
  const user = localStorage.getItem("tce_user");
  return user ? JSON.parse(user) : null;
};

export default api;
