const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://topback.sergioromero.duckdns.org/api';

class ApiClient {
  static async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    
    console.log('🔍 API Request:', { url, method: options.method || 'GET', API_BASE_URL });
    
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    try {
      console.log('📤 Sending request with config:', config);
      const response = await fetch(url, config);
      const data = await response.json();

      console.log('📥 Response:', { status: response.status, ok: response.ok, data });

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('❌ API request failed:', error);
      throw error;
    }
  }

  static get(endpoint, options = {}) {
    return this.request(endpoint, { method: 'GET', ...options });
  }

  static post(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'POST', body, ...options });
  }

  static patch(endpoint, body = {}, options = {}) {
    return this.request(endpoint, { method: 'PATCH', body, ...options });
  }

  static put(endpoint, body, options = {}) {
    return this.request(endpoint, { method: 'PUT', body, ...options });
  }

  static delete(endpoint, options = {}) {
    return this.request(endpoint, { method: 'DELETE', ...options });
  }
}

// API endpoints específicos
export const api = {
  // Lists
  createList: (listData) => ApiClient.post('/lists', listData),
  getList: (listId) => ApiClient.get(`/lists/${listId}`),
  
  // Items
  addItem: (listId, itemData) => ApiClient.post(`/lists/${listId}/items`, itemData),
  likeItem: (itemId) => ApiClient.post(`/items/${itemId}/like`),
  updateItemPosition: (itemId, position) => ApiClient.patch(`/items/${itemId}/position`, { position }),
  reorderItems: (listId, itemsOrder) => ApiClient.put(`/lists/${listId}/items/reorder`, { itemsOrder }),
  
  // Advanced Voting (Hito 5)
  voteItem: (itemId, voteType = 'like', voterId = null) => 
    ApiClient.post(`/items/${itemId}/vote`, { voteType, voterId }),
  removeVote: (itemId, voterId = null) => 
    ApiClient.delete(`/items/${itemId}/vote`, { voterId }),
  getItemStats: (itemId) => ApiClient.get(`/items/${itemId}/stats`),
  getTopVoted: (listId, limit = 10) => ApiClient.get(`/lists/${listId}/top-voted?limit=${limit}`),
  getVotingActivity: (listId, hours = 24) => ApiClient.get(`/lists/${listId}/voting-activity?hours=${hours}`),
};

export default ApiClient;
