/**
 * Saim Jr Accounting - Production API Client
 * Secure connection to MCP backend server with authentication
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T = unknown> {
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

interface AuthResponse {
  access_token: string;
  user_id?: string;
  username?: string;
}

interface ChartOfAccountsResponse {
  accounts: Array<{
    code: string;
    name: string;
    type: string;
    description?: string;
  }>;
  metadata: {
    total_accounts: number;
    company_type: string;
    industry: string;
    generated_at: string;
  };
  status: string;
}

interface ValidationResponse {
  is_valid: boolean;
  suggestions?: string[];
  confidence_score?: number;
}

interface TransactionCategoryResponse {
  category: string;
  confidence: number;
  account_code?: string;
}

interface Company {
  id: string;
  name: string;
  company_type?: string;
  industry?: string;
  business_size?: string;
  created_at?: string;
}

interface HealthResponse {
  status: string;
  timestamp: string;
  version?: string;
}

interface FileUploadResponse {
  file_id: string;
  filename: string;
  size: number;
  status: string;
}

// Stage 1: Company Profile Interfaces
interface CompanyProfileRequest {
  company_name: string;
  nature_of_business: string;
  industry: string;
  location: string;
  company_type: string;
  reporting_framework?: string;
  statutory_compliances?: string[];
  business_size?: string;
  annual_turnover?: number;
  employee_count?: number;
}

interface CompanyProfileResponse {
  id: number;
  company_name: string;
  nature_of_business: string;
  industry: string;
  location: string;
  company_type: string;
  reporting_framework: string;
  statutory_compliances: string[];
  business_size: string;
  annual_turnover?: number;
  employee_count?: number;
  created_at: string;
}

// Stage 2: Chart of Accounts Interfaces
interface FinancialStatement {
  name: string;
  type: string;
  description?: string;
}

interface AccountClass {
  name: string;
  statement: string;
  type: string;
}

interface AccountClassification {
  name: string;
  class: string;
  description?: string;
}

interface AccountSubclassification {
  name: string;
  classification: string;
  description?: string;
}

interface ChartOfAccount {
  account_code: string;
  account_name: string;
  account_type: string;
  parent_code?: string;
  level: number;
  is_active: boolean;
}

interface COAWorkflowResponse {
  status: string;
  company_profile: CompanyProfileResponse;
  workflow_steps: {
    statements: Record<string, FinancialStatement>;
    classes: Record<string, AccountClass>;
    classifications: Record<string, AccountClassification>;
    subclassifications: Record<string, AccountSubclassification>;
  };
  chart_of_accounts: Record<string, ChartOfAccount>;
  metadata: {
    total_accounts: number;
    generated_at: string;
    ai_model?: string;
    generation_method: string;
  };
}

interface COAUploadResponse {
  status: string;
  message: string;
  filename: string;
  company_id: number;
}

// Stage 3: Contact Management Interfaces
interface ContactRequest {
  name: string;
  contact_type?: string;
  email?: string;
  phone?: string;
  address?: string;
  tax_id?: string;
}

interface ContactResponse {
  id: number;
  name: string;
  contact_type: string;
  email?: string;
  phone?: string;
  is_verified: boolean;
  created_at: string;
}

interface ContactListResponse {
  contacts: ContactResponse[];
  total: number;
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

    try {
      const url = `${this.baseUrl}/auth/login`;
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          error: data.error || data.detail || 'Login failed',
          status_code: response.status,
        };
      }

      // Save token if login successful
      if (data.access_token) {
        this.saveToken(data.access_token);
      }

      return { data };
    } catch (error) {
      console.error('Login Error:', error);
      return {
        error: error instanceof Error ? error.message : 'Network error during login',
        status_code: 500,
      };
    }
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/auth/register', {
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
  async generateChartOfAccounts(request: ChartOfAccountsRequest): Promise<ApiResponse<ChartOfAccountsResponse>> {
    return this.request<ChartOfAccountsResponse>('/api/generate-chart-of-accounts', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async validateInput(request: ValidateInputRequest): Promise<ApiResponse<ValidationResponse>> {
    return this.request<ValidationResponse>('/api/validate-input', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async categorizeTransaction(request: TransactionRequest): Promise<ApiResponse<TransactionCategoryResponse>> {
    return this.request<TransactionCategoryResponse>('/api/categorize-transaction', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Company Management
  async createCompany(companyData: CompanyRequest): Promise<ApiResponse<Company>> {
    return this.request<Company>('/api/companies', {
      method: 'POST',
      body: JSON.stringify(companyData),
    });
  }

  async getCompanies(): Promise<ApiResponse<Company[]>> {
    return this.request<Company[]>('/api/companies');
  }

  // Health Check
  async healthCheck(): Promise<ApiResponse<HealthResponse>> {
    return this.request<HealthResponse>('/health');
  }

  // Company Profile Management (Stage 1)
  async createCompanyProfile(profileData: CompanyProfileRequest): Promise<ApiResponse<CompanyProfileResponse>> {
    return this.request<CompanyProfileResponse>('/api/company-profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  }

  async getCompanyProfile(companyId: number): Promise<ApiResponse<CompanyProfileResponse>> {
    return this.request<CompanyProfileResponse>(`/api/company-profile/${companyId}`);
  }

  // Chart of Accounts Management (Stage 2)
  async generateCOAWorkflow(companyId: number): Promise<ApiResponse<COAWorkflowResponse>> {
    return this.request<COAWorkflowResponse>(`/api/coa/generate/${companyId}`, {
      method: 'POST',
    });
  }

  async uploadCOA(companyId: number, file: File): Promise<ApiResponse<COAUploadResponse>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<COAUploadResponse>(`/api/coa/upload/${companyId}`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        // Don't set Content-Type for FormData
      } as HeadersInit,
    });
  }

  // Contact Management (Stage 3)
  async createContact(companyId: number, contactData: ContactRequest): Promise<ApiResponse<ContactResponse>> {
    return this.request<ContactResponse>(`/api/contacts/${companyId}`, {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async getContacts(companyId: number): Promise<ApiResponse<ContactListResponse>> {
    return this.request<ContactListResponse>(`/api/contacts/${companyId}`);
  }

  // File Upload (placeholder for future implementation)
  async uploadFile(file: File, companyId: number): Promise<ApiResponse<FileUploadResponse>> {
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
  CompanyProfileRequest,
  CompanyProfileResponse,
  COAWorkflowResponse,
  COAUploadResponse,
  ContactRequest,
  ContactResponse,
  ContactListResponse,
};

// Export class for custom instances
export { SaimJrApiClient };