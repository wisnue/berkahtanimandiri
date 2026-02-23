const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

interface ApiError {
  success: false;
  message: string;
  errors?: Array<{ field: string; message: string }>;
}

interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

type ApiResponse<T> = ApiSuccess<T> | ApiError;

class ApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;
  private tokenFetchPromise: Promise<void> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
    // Fetch CSRF token immediately on initialization
    this.tokenFetchPromise = this.fetchCSRFToken();
  }

  /**
   * Fetch CSRF token from backend
   */
  private async fetchCSRFToken(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      });
      
      if (response.ok) {
        const data = await response.json();
        this.csrfToken = data.data?.csrfToken || null;
        console.log('CSRF token fetched successfully:', this.csrfToken?.substring(0, 20) + '...');
      } else {
        console.error('Failed to fetch CSRF token - status:', response.status);
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }

  /**
   * Ensure CSRF token is fetched before proceeding
   */
  private async ensureToken(): Promise<void> {
    if (this.tokenFetchPromise) {
      await this.tokenFetchPromise;
      this.tokenFetchPromise = null; // Clear after first use
    }
  }

  /**
   * Refresh CSRF token if needed
   */
  async refreshCSRFToken(): Promise<void> {
    await this.fetchCSRFToken();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Add CSRF token to headers for state-changing requests
    const needsCSRF = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(options.method || 'GET');
    
    // Wait for initial token fetch if this request needs CSRF token
    if (needsCSRF) {
      await this.ensureToken();
    }
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Add CSRF token if available and needed
    if (needsCSRF && this.csrfToken) {
      headers['x-csrf-token'] = this.csrfToken;
      console.log('Adding CSRF token to request:', this.csrfToken.substring(0, 20) + '...');
    } else if (needsCSRF && !this.csrfToken) {
      console.error('CSRF token required but not available!');
    }
    
    const config: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      // If CSRF token is invalid, try to refresh and retry once
      if (!response.ok && (data.code === 'CSRF_TOKEN_INVALID' || data.code === 'CSRF_TOKEN_MISSING')) {
        console.log('CSRF token invalid, refreshing...');
        await this.refreshCSRFToken();
        
        // Retry request with new token
        if (this.csrfToken) {
          headers['x-csrf-token'] = this.csrfToken;
          const retryResponse = await fetch(url, { ...config, headers });
          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            return {
              success: false,
              message: retryData.message || 'Terjadi kesalahan',
              errors: retryData.errors,
            };
          }
          
          return {
            success: true,
            data: retryData.data || retryData,
            message: retryData.message,
            pagination: retryData.pagination, // ✅ Include pagination in retry
          };
        }
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Terjadi kesalahan',
          errors: data.errors,
        };
      }

      return {
        success: true,
        data: data.data || data,
        message: data.message,
        pagination: data.pagination, // ✅ Include pagination from backend
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async patch<T>(endpoint: string, data: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    
    // Wait for initial token fetch
    await this.ensureToken();
    
    // Add CSRF token to FormData for upload requests
    if (this.csrfToken) {
      formData.append('_csrf', this.csrfToken);
      console.log('Adding CSRF token to upload:', this.csrfToken.substring(0, 20) + '...');
    } else {
      console.error('CSRF token not available for upload!');
    }
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        // Add CSRF token to headers as well
        headers: this.csrfToken ? { 'x-csrf-token': this.csrfToken } : {},
      });

      const data = await response.json();

      // Handle CSRF token refresh for uploads too
      if (!response.ok && (data.code === 'CSRF_TOKEN_INVALID' || data.code === 'CSRF_TOKEN_MISSING')) {
        console.log('CSRF token invalid in upload, refreshing...');
        await this.refreshCSRFToken();
        
        // Retry upload with new token
        if (this.csrfToken) {
          // Update FormData with new token
          formData.set('_csrf', this.csrfToken);
          
          const retryResponse = await fetch(url, {
            method: 'POST',
            body: formData,
            credentials: 'include',
            headers: { 'x-csrf-token': this.csrfToken },
          });

          const retryData = await retryResponse.json();
          
          if (!retryResponse.ok) {
            return {
              success: false,
              message: retryData.message || 'Upload failed',
            };
          }

          return {
            success: true,
            data: retryData.data || retryData,
          };
        }
      }

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Upload failed',
        };
      }

      return {
        success: true,
        data: data.data || data,
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Upload error',
      };
    }
  }
}

export const api = new ApiClient(API_BASE_URL);

export type { ApiResponse, ApiError, ApiSuccess };
