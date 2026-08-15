import { supabase } from '../config/supabase';

// ✅ Garantir que a URL base está correta
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:10000";

async function getAccessToken(): Promise<string | null> {
  const { data } = await supabase.auth.getSession();
  return data?.session?.access_token ?? null;
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const token = await getAccessToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
}

export const api = {
  get: async <T = any>(endpoint: string): Promise<T> => {
    const headers = await getAuthHeaders();
    
    console.log(`📡 [GET] ${API_BASE}/api${endpoint}`);
    
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      headers,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Erro ${response.status}` }));
      throw new Error(error.message || error.error || `Erro ${response.status}`);
    }
    return response.json();
  },

  post: async <T = any>(endpoint: string, data?: any, options?: { headers?: HeadersInit }): Promise<T> => {
    const headers = await getAuthHeaders();
    const isFormData = data instanceof FormData;

    if (isFormData) {
      delete (headers as Record<string, string>)['Content-Type'];
    }

    const mergedHeaders = options?.headers
      ? { ...headers, ...(options.headers as Record<string, string>) }
      : headers;

    console.log(`📤 [POST] ${API_BASE}/api${endpoint}`);
    if (!isFormData) {
      console.log('📤 Dados enviados:', JSON.stringify(data, null, 2));
    }
    
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      method: 'POST',
      headers: mergedHeaders,
      body: isFormData ? data : data ? JSON.stringify(data) : undefined,
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Erro ${response.status}` }));
      console.error('❌ Erro na resposta:', error);
      throw new Error(error.message || error.error || `Erro ${response.status}`);
    }
    return response.json();
  },

  put: async <T = any>(endpoint: string, data: any, options?: { headers?: HeadersInit }): Promise<T> => {
    const headers = await getAuthHeaders();
    const isFormData = data instanceof FormData;

    if (isFormData) {
      delete (headers as Record<string, string>)['Content-Type'];
    }

    const mergedHeaders = options?.headers
      ? { ...headers, ...(options.headers as Record<string, string>) }
      : headers;

    console.log(`📤 [PUT] ${API_BASE}/api${endpoint}`);
    if (!isFormData) {
      console.log('📤 Dados enviados:', JSON.stringify(data, null, 2));
    }
    
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      method: 'PUT',
      headers: mergedHeaders,
      body: isFormData ? data : JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Erro ${response.status}` }));
      console.error('❌ Erro na resposta:', error);
      throw new Error(error.message || error.error || `Erro ${response.status}`);
    }
    return response.json();
  },

  delete: async (endpoint: string): Promise<void> => {
    const headers = await getAuthHeaders();
    
    console.log(`🗑️ [DELETE] ${API_BASE}/api${endpoint}`);
    
    const response = await fetch(`${API_BASE}/api${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `Erro ${response.status}` }));
      throw new Error(error.message || error.error || `Erro ${response.status}`);
    }
  },
};