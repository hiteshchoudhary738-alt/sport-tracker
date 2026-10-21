// Base API URL configuration for Development and Production
// In production, when served from same host or defined via VITE_API_URL, use that.
// In local dev, falls back to http://localhost:5000.
export const API_BASE_URL = import.meta.env.VITE_API_URL !== undefined 
  ? import.meta.env.VITE_API_URL 
  : (import.meta.env.DEV ? 'http://localhost:5000' : '');
