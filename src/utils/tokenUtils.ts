/**
 * Utility functions for JWT token handling
 */

/**
 * Decodes a JWT token without verification (client-side only)
 * Note: This does NOT verify the signature - that's done by the backend
 */
export const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Checks if a JWT token is expired
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return true; // If we can't decode or no expiration, consider it expired
    }
    
    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = decoded.exp * 1000;
    const currentTime = Date.now();
    
    // Add a 30 second buffer to refresh before actual expiration
    const bufferTime = 30 * 1000; // 30 seconds
    
    return currentTime >= (expirationTime - bufferTime);
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't check, consider it expired
  }
};

/**
 * Gets the expiration time of a token
 */
export const getTokenExpiration = (token: string): Date | null => {
  try {
    const decoded = decodeToken(token);
    if (!decoded || !decoded.exp) {
      return null;
    }
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

/**
 * Validates token format and expiration
 */
export const isValidToken = (token: string | null): boolean => {
  if (!token) {
    return false;
  }
  
  // Check token format (should have 3 parts separated by dots)
  const parts = token.split('.');
  if (parts.length !== 3) {
    return false;
  }
  
  // Check if token is expired
  return !isTokenExpired(token);
};

