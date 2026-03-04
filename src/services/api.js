const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
      console.error('Make sure backend server is running on', API_BASE.replace('/api', ''));
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
  getCustomers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/db/datamart/customer${query ? `?${query}` : ''}`);
  },
  getTransactions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/db/datamart/transaction${query ? `?${query}` : ''}`);
  },
  getLocations: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/db/datamart/location${query ? `?${query}` : ''}`);
  },
};

export const aiApi = {
  getConfigs: () => request('/ai/configs'),
  getConfig: () => request('/ai/config'),
  updateConfig: (modelId, updates) => request(`/ai/config/${modelId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
};

export const zaloApi = {
  getConfig: () => request('/zalo/config'),
  getTemplates: () => request('/zalo/templates'),
};
