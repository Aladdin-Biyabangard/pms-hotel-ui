import {Role} from '@/types/enums';

/**
 * Check if user has a specific role
 */
export const hasRole = (userRoles: string[], role: Role | string): boolean => {
    const roleString = typeof role === 'string' ? role : role;
    return userRoles.some(r => r === roleString || r === `ROLE_${roleString}`);
};

/**
 * Check if user has any of the specified roles
 */
export const hasAnyRole = (userRoles: string[], roles: (Role | string)[]): boolean => {
    return roles.some(role => hasRole(userRoles, role));
};

/**
 * Check if user has all of the specified roles
 */
export const hasAllRoles = (userRoles: string[], roles: (Role | string)[]): boolean => {
    return roles.every(role => hasRole(userRoles, role));
};

/**
 * Check if user is DIRECTOR (highest privilege)
 */
export const isDirector = (userRoles: string[]): boolean => {
    return hasRole(userRoles, Role.DIRECTOR);
};

/**
 * Check if user can manage hotels (DIRECTOR only)
 */
export const canManageHotels = (userRoles: string[]): boolean => {
    return isDirector(userRoles);
};

/**
 * Check if user can manage rooms (ADMIN, MANAGER, FRONT_DESK)
 */
export const canManageRooms = (userRoles: string[]): boolean => {
    return hasAnyRole(userRoles, [Role.ADMIN, Role.MANAGER, Role.FRONT_DESK]);
};

