
// Configuration file for dynamic API settings
export const getApiBaseUrl = () => {
  // Check if we're in the Replit environment
  const isReplit = typeof window !== 'undefined' && window.location.hostname.includes('replit');
  
  // For Replit, use the same host but with the known backend port
  if (isReplit) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    return `${protocol}//${hostname}:3001`;
  }
  
  // Default local development URL
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();
