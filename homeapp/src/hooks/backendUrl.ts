export const getBackendUrl = () => {
  // Check if there's an env variable first
  if (import.meta.env.BACKEND_URL) {
    return import.meta.env.BACKEND_URL;
  }
  
  // For browser environment, use current hostname
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    
    // If accessing via localhost, use localhost
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    
    // Otherwise use the same hostname (your IP) with backend port
    return `http://${hostname}:3000`;
  }
  
  return 'http://localhost:3000';
};
