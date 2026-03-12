// Tự động detect API base URL:
// - Localhost (dev): http://localhost:30060/api/v1 (backend chạy riêng)
// - Production: /api/v1 (relative path, backend serve cả static + API cùng port)
const getDefaultApiBase = () => {
  if (typeof window === 'undefined') return '/api/v1';
  
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isDev = import.meta.env.DEV;
  
  // Dev mode: backend chạy riêng port 30060
  if (isDev && isLocalhost) {
    return 'http://localhost:30060/api/v1';
  }
  
  // Production: relative path (backend serve cả static + API cùng port)
  return '/api/v1';
};

const API_BASE = import.meta.env.VITE_API_URL || getDefaultApiBase();

const request = async (endpoint, options = {}) => {
  const url = `${API_BASE}${endpoint}`;
  try {
    console.log(`[API] ${options.method || 'GET'} ${url}`);
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      console.error(`[API Error] ${response.status} ${url}:`, error);
      throw new Error(error.error || `HTTP ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[API Success] ${url}`);
    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error(`[API Network Error] Cannot connect to ${url}`);
      console.error('Make sure backend server is running and API_BASE is correct:', API_BASE);
      throw new Error(`Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.`);
    }
    console.error(`[API Error] ${url}:`, error);
    throw error;
  }
};

export const dbApi = {
  getConfig: () => request('/db/config'),
  saveConfig: (config) => request('/db/config', {
    method: 'POST',
    body: JSON.stringify(config),
  }),
  testConnection: (config) => request('/db/test', {
    method: 'POST',
    body: JSON.stringify(config),
  }),
  checkHealth: () => request('/db/health'),
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/db/datamart/customer${query ? `?${query}` : ''}`);
  },
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/db/datamart/transaction${query ? `?${query}` : ''}`);
  },
  getCustomerOrders: (customerId, params = {}) => {
    const query = new URLSearchParams({ customerId, ...params }).toString();
    return request(`/db/datamart/transaction?${query}`);
  },
  getCustomerDetails: (customerId) => request(`/db/datamart/customer/${customerId}/details`),
  getCustomerModal: (customerId) => request(`/db/datamart/customer/${customerId}/modal`),
  getLocations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/db/datamart/location${query ? `?${query}` : ''}`);
  },
  getOverview: () => request('/db/datamart/overview'),
  getSales: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/db/datamart/sales${q ? `?${q}` : ''}`);
  },
  getMarketing: () => request('/db/datamart/marketing'),
  getCustomerPersona: (customerId) => request(`/db/datamart/customer/${customerId}/persona`),
  getPredictions: (params = {}) => {
    const q = new URLSearchParams(params).toString();
    return request(`/db/datamart/predictions${q ? `?${q}` : ''}`);
  },
  getCustomerByPhone: (phone) => request(`/db/v1/customer/${encodeURIComponent(phone)}`),
};

export const aiApi = {
  getConfigs: () => request('/ai/configs'),
  getConfig: () => request('/ai/config'),
  getConfigByModel: (modelId) => request(`/ai/config/model/${modelId}`),
  updateConfig: (modelId, updates) => request(`/ai/config/${modelId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  testConnection: (modelId, apiKey, apiEndpoint) => request('/ai/test', {
    method: 'POST',
    body: JSON.stringify({ modelId, apiKey, apiEndpoint }),
  }),
  runPredictions: (data) => request('/ai/predictions', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  analyzeCustomer: (phone, customerData) => request('/ai/customer-analysis', {
    method: 'POST',
    body: JSON.stringify({ phone, customerData }),
  }),
  chat: (data) => request('/ai/chat', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const zaloApi = {
  getConfig: () => request('/zalo/config'),
  getTemplates: () => request('/zalo/templates'),
};

