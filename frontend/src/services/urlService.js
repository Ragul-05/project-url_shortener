import axios from 'axios';

const apiClient = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    'Content-Type': 'application/json',
  },
});

export async function shortenUrl(originalUrl) {
  try {
    const response = await apiClient.post('/api/shorten', originalUrl);
    return response.data?.data;
  } catch (error) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 400) {
      if (message?.toLowerCase().includes('customcode')) {
        throw new Error(message);
      }

      if (message?.toLowerCase().includes('expirydate')) {
        throw new Error(message);
      }

      if (message?.toLowerCase().includes('url')) {
        throw new Error('Invalid URL');
      }
    }

    throw new Error('Something went wrong');
  }
}

export async function fetchUrls({ search = '', page = 1, limit = 6 } = {}) {
  try {
    const response = await apiClient.get('/api/urls', {
      params: {
        search,
        page,
        limit,
      },
    });
    return response.data?.data ?? [];
  } catch {
    throw new Error('Something went wrong');
  }
}

export async function deleteUrl(id) {
  try {
    await apiClient.delete(`/api/urls/${id}`);
  } catch {
    throw new Error('Something went wrong');
  }
}

export async function updateUrlStatus(id, isActive) {
  try {
    const response = await apiClient.patch(`/api/urls/${id}/status`, { isActive });
    return response.data?.data;
  } catch {
    throw new Error('Something went wrong');
  }
}

export async function fetchUrlAnalytics(id) {
  try {
    const response = await apiClient.get(`/api/urls/${id}/analytics`);
    return response.data?.data;
  } catch {
    throw new Error('Something went wrong');
  }
}

export async function fetchInsights() {
  try {
    const response = await apiClient.get('/api/analytics/insights');
    return response.data?.data;
  } catch {
    throw new Error('Failed to load insights');
  }
}

export async function fetchMetadataByCategory(category) {
  try {
    const response = await apiClient.get(`/api/urls/category/${category}`);
    return response.data?.data ?? [];
  } catch {
    return [];
  }
}
