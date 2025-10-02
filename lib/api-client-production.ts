/**
 * Saim Jr Accounting - Production API Client
 * Secure connection to MCP backend server with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status_code?: number;
}

interface ChartOfAccountsRequest {
  company_type?: string;
  business_size?: string;
  industry?: string;
}

interface ValidateInputRequest {
  input_text: string;
  context?: string;
}

interface TransactionRequest {
  description: string;
  amount: number;
  transaction_type?: string;
}

interface CompanyRequest {
  name: string;
  company_type?: string;
  industry?: string;
  business_size?: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

class SaimJrApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.loadToken();
  }

  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('saimjr_access_token');
    }
  }

  private saveToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('saimjr_access_token', token);
    }
  }

  private clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saimjr_access_token');
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...this.getHeaders(),
          ...options.headers,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || data.detail || 'Request failed',
          status_code: response.status,
        };
      }

      return { data };
    } catch (error) {
      console.error('API Request Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error',
        status_code: 500,
      };
    }
  }

  // Authentication Methods
  async login(credentials: LoginRequest): Promise<ApiResponse<{ access_token: string; token_type: string; expires_in: number }>> {
    const formData = new FormData();
    formData.append('username', credentials.username);
    formData.append('password', credentials.password);

    const response = await this.request<{ access_token: string; token_type: string; expires_in: number }>('/auth/login', {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type to let browser set it for FormData
    });

    if (response.data?.access_token) {
      this.saveToken(response.data.access_token);
    }

    return response;
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<any>> {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  logout(): void {
    this.clearToken();
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Business Logic Methods
  async generateChartOfAccounts(request: ChartOfAccountsRequest): Promise<ApiResponse<any>> {
    return this.request('/api/generate-chart-of-accounts', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async validateInput(request: ValidateInputRequest): Promise<ApiResponse<any>> {
    return this.request('/api/validate-input', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async categorizeTransaction(request: TransactionRequest): Promise<ApiResponse<any>> {
    return this.request('/api/categorize-transaction', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Company Management
  async createCompany(companyData: CompanyRequest): Promise<ApiResponse<any>> {
    return this.request('/api/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async getCompanies(): Promise<ApiResponse<any[]>> {
    return this.request<any[]>('/api/companies');
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<any>> {
    return this.request('/health');
  }

  // File Upload (placeholder for future implementation)
  async uploadFile(file: File, companyId: number): Promise<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('company_id', companyId.toString());

    return this.request('/api/upload-file', {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        // Don't set Content-Type, let browser set it for FormData
      } as HeadersInit,
    });
  }
}

// Create singleton instance
export const apiClient = new SaimJrApiClient();

// Export types for use in components
export type {
  ApiResponse,
  ChartOfAccountsRequest,
  ValidateInputRequest,
  TransactionRequest,
  CompanyRequest,
  LoginRequest,
  RegisterRequest,
};

// Export class for custom instances
export { SaimJrApiClient };