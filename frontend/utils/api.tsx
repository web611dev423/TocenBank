import axios from "axios";
import https from 'https';

// Create axios instance with proper configuration
const apiClient = axios.create({
  baseURL: "http://localhost:3001/api", // Changed to http for local development
  timeout: 10000,
  headers: {
    "Content-Type": "application/json"
  },
  withCredentials: true, // Important for cookies/auth
  httpsAgent: new https.Agent({  
    rejectUnauthorized: false // Only for development!
  })
});

// Request interceptor for logging
apiClient.interceptors.request.use(config => {
  console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
  return config;
});

// Response interceptor for error handling
apiClient.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.message || error.message;
    console.error("API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: errorMessage
    });
    return Promise.reject(error);
  }
);

export const postUserData = async (endpoint: string, data: any) => {
  try {
    const response = await apiClient.post(endpoint, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: true, message: "Failed to send data" };
  }
};

export const getData = async (endpoint: string) => {
  try {
    const response = await apiClient.get(endpoint);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: true, message: "Failed to fetch data" };
  }
};

export const updateUserData = async (endpoint: string, data: any) => {
  try {
    const response = await apiClient.put(endpoint, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: true, message: "Failed to update data" };
  }
};

export const deleteUserData = async (endpoint: string) => {
  try {
    const response = await apiClient.delete(endpoint);
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: true, message: "Failed to delete data" };
  }
};

export const checkApiHealth = async () => {
  try {
    const response = await apiClient.get("/health", { timeout: 5000 });
    return { available: true, status: response.status };
  } catch (error) {
    console.error("API Health Check Failed:", error.message);
    return { 
      available: false, 
      status: error.response?.status,
      message: error.response?.data?.message || "API is unavailable" 
    };
  }
};