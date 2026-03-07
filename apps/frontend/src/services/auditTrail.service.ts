import { api } from './api';

export interface AuditTrailEntry {
  id: string;
  userId: string;
  userName?: string;
  tableName: string;
  recordId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'APPROVE' | 'REJECT';
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  changedFields?: string[];
  ipAddress?: string;
  userAgent?: string;
  description?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface AuditTrailStats {
  totalLogs: number;
  actionBreakdown: {
    CREATE: number;
    UPDATE: number;
    DELETE: number;
    VERIFY: number;
    APPROVE: number;
    REJECT: number;
  };
  tableBreakdown: Array<{
    tableName: string;
    count: number;
  }>;
  userBreakdown: Array<{
    userName: string;
    count: number;
  }>;
}

export interface GetAuditTrailParams {
  page?: number;
  limit?: number;
  tableName?: string;
  action?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  ipAddress?: string;
}

const auditTrailService = {
  async getAll(params?: GetAuditTrailParams) {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.tableName) queryParams.append('tableName', params.tableName);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.search) queryParams.append('search', params.search);

    const query = queryParams.toString();
    return api.get(`/audit-trail${query ? `?${query}` : ''}`);
  },

  async getById(id: string) {
    return api.get(`/audit-trail/${id}`);
  },

  async getByRecord(tableName: string, recordId: string) {
    return api.get(`/audit-trail/record/${tableName}/${recordId}`);
  },

  async getStatistics(startDate?: string, endDate?: string) {
    const query = new URLSearchParams();
    if (startDate) query.append('startDate', startDate);
    if (endDate) query.append('endDate', endDate);
    
    const queryString = query.toString();
    return api.get(`/audit-trail/statistics${queryString ? `?${queryString}` : ''}`);
  },

  async exportToCSV(params?: GetAuditTrailParams): Promise<Blob> {
    const queryParams = new URLSearchParams();
    
    if (params?.tableName) queryParams.append('tableName', params.tableName);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);

    const query = queryParams.toString();
    
    const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
    const response = await fetch(`${API_BASE_URL}/audit-trail/export${query ? `?${query}` : ''}`, {
      method: 'GET',
      credentials: 'include',
    });
    
    if (!response.ok) {
      throw new Error('Failed to export audit trail');
    }
    
    return response.blob();
  },
};

export default auditTrailService;
