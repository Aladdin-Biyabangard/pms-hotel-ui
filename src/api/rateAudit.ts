import {api} from './axios';

// Audit action types
export type RateAuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'BULK_UPDATE'
  | 'COPY'
  | 'OVERRIDE_CREATE'
  | 'OVERRIDE_UPDATE'
  | 'OVERRIDE_DELETE'
  | 'STOP_SELL'
  | 'RATE_CHANGE'
  | 'AVAILABILITY_CHANGE'
  | 'TIER_UPDATE'
  | 'PACKAGE_UPDATE'
  | 'RULE_APPLY';

// Entity types that can be audited
export type RateAuditEntityType = 
  | 'ROOM_RATE'
  | 'RATE_PLAN'
  | 'RATE_OVERRIDE'
  | 'RATE_TIER'
  | 'RATE_PACKAGE_COMPONENT'
  | 'PRICING_RULE';

export interface RateAuditResponse {
  id: number;
  hotelId: number;
  entityType: RateAuditEntityType;
  entityId: number;
  entityName?: string;
  action: RateAuditAction;
  userId: number;
  userName: string;
  userEmail?: string;
  previousValue?: string; // JSON string of previous state
  newValue?: string; // JSON string of new state
  changedFields?: string[]; // List of changed field names
  changeDescription?: string; // Human-readable description
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface RateAuditSummary {
  totalChanges: number;
  changesByAction: Record<string, number>;
  changesByUser: Record<string, number>;
  changesByEntity: Record<string, number>;
  recentActivity: RateAuditResponse[];
}

export interface RateAuditCompare {
  field: string;
  fieldLabel: string;
  previousValue: any;
  newValue: any;
  changeType: 'added' | 'removed' | 'modified';
}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements?: number;
}

export interface RateAuditSearchParams {
  entityType?: RateAuditEntityType;
  entityId?: number;
  action?: RateAuditAction;
  userId?: number;
  startDate?: string;
  endDate?: string;
  searchTerm?: string;
}

// Audit action labels
export const AUDIT_ACTION_LABELS: Record<RateAuditAction, string> = {
  CREATE: 'Created',
  UPDATE: 'Updated',
  DELETE: 'Deleted',
  BULK_UPDATE: 'Bulk Updated',
  COPY: 'Copied',
  OVERRIDE_CREATE: 'Override Created',
  OVERRIDE_UPDATE: 'Override Updated',
  OVERRIDE_DELETE: 'Override Deleted',
  STOP_SELL: 'Stop Sell Changed',
  RATE_CHANGE: 'Rate Changed',
  AVAILABILITY_CHANGE: 'Availability Changed',
  TIER_UPDATE: 'Tier Updated',
  PACKAGE_UPDATE: 'Package Updated',
  RULE_APPLY: 'Rule Applied',
};

// Entity type labels
export const ENTITY_TYPE_LABELS: Record<RateAuditEntityType, string> = {
  ROOM_RATE: 'Room Rate',
  RATE_PLAN: 'Rate Plan',
  RATE_OVERRIDE: 'Rate Override',
  RATE_TIER: 'Rate Tier',
  RATE_PACKAGE_COMPONENT: 'Package Component',
  PRICING_RULE: 'Pricing Rule',
};

// Action colors for UI
export const AUDIT_ACTION_COLORS: Record<RateAuditAction, { bg: string; text: string }> = {
  CREATE: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300' },
  UPDATE: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300' },
  DELETE: { bg: 'bg-rose-100 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300' },
  BULK_UPDATE: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300' },
  COPY: { bg: 'bg-cyan-100 dark:bg-cyan-900/30', text: 'text-cyan-700 dark:text-cyan-300' },
  OVERRIDE_CREATE: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  OVERRIDE_UPDATE: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  OVERRIDE_DELETE: { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300' },
  STOP_SELL: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-300' },
  RATE_CHANGE: { bg: 'bg-indigo-100 dark:bg-indigo-900/30', text: 'text-indigo-700 dark:text-indigo-300' },
  AVAILABILITY_CHANGE: { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-300' },
  TIER_UPDATE: { bg: 'bg-violet-100 dark:bg-violet-900/30', text: 'text-violet-700 dark:text-violet-300' },
  PACKAGE_UPDATE: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-300' },
  RULE_APPLY: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300' },
};

export const rateAuditApi = {
  // Get paginated audit logs
  getAuditLogs: async (
    page = 0,
    size = 20,
    params?: RateAuditSearchParams
  ): Promise<CustomPage<RateAuditResponse>> => {
    const response = await api.get<CustomPage<RateAuditResponse>>('/rate-audits', {
      params: { page, size, ...params }
    });
    return response.data;
  },

  // Get single audit log detail
  getAuditLog: async (id: number): Promise<RateAuditResponse> => {
    const response = await api.get<RateAuditResponse>(`/rate-audits/${id}`);
    return response.data;
  },

  // Get audit logs for a specific entity
  getEntityAuditLogs: async (
    entityType: RateAuditEntityType,
    entityId: number,
    page = 0,
    size = 10
  ): Promise<CustomPage<RateAuditResponse>> => {
    const response = await api.get<CustomPage<RateAuditResponse>>(`/rate-audits/entity/${entityType}/${entityId}`, {
      params: { page, size }
    });
    return response.data;
  },

  // Get audit summary for dashboard
  getAuditSummary: async (
    startDate?: string,
    endDate?: string
  ): Promise<RateAuditSummary> => {
    const response = await api.get<RateAuditSummary>('/rate-audits/summary', {
      params: { startDate, endDate }
    });
    return response.data;
  },

  // Export audit logs
  exportAuditLogs: async (
    format: 'csv' | 'excel' | 'pdf',
    params?: RateAuditSearchParams
  ): Promise<Blob> => {
    const response = await api.get(`/rate-audits/export`, {
      params: { format, ...params },
      responseType: 'blob'
    });
    return response.data;
  },

  // Rollback to previous state (admin only)
  rollbackChange: async (auditId: number): Promise<void> => {
    await api.post(`/rate-audits/${auditId}/rollback`);
  },
};

// Helper function to parse JSON values safely
export const parseAuditValue = (value?: string): any => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

// Helper function to generate field comparison
export const generateFieldComparison = (audit: RateAuditResponse): RateAuditCompare[] => {
  const previous = parseAuditValue(audit.previousValue) || {};
  const current = parseAuditValue(audit.newValue) || {};
  const comparisons: RateAuditCompare[] = [];
  
  // Get all unique keys
  const allKeys = new Set([...Object.keys(previous), ...Object.keys(current)]);
  
  allKeys.forEach(key => {
    const prevVal = previous[key];
    const newVal = current[key];
    
    if (prevVal === undefined && newVal !== undefined) {
      comparisons.push({
        field: key,
        fieldLabel: formatFieldLabel(key),
        previousValue: null,
        newValue: newVal,
        changeType: 'added',
      });
    } else if (prevVal !== undefined && newVal === undefined) {
      comparisons.push({
        field: key,
        fieldLabel: formatFieldLabel(key),
        previousValue: prevVal,
        newValue: null,
        changeType: 'removed',
      });
    } else if (JSON.stringify(prevVal) !== JSON.stringify(newVal)) {
      comparisons.push({
        field: key,
        fieldLabel: formatFieldLabel(key),
        previousValue: prevVal,
        newValue: newVal,
        changeType: 'modified',
      });
    }
  });
  
  return comparisons;
};

// Format field name to human-readable label
const formatFieldLabel = (field: string): string => {
  return field
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .replace(/_/g, ' ')
    .trim();
};

