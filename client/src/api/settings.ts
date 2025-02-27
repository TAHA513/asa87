
import { apiClient } from './client';

export async function getApiKeys() {
  const response = await apiClient.get('/api/settings/api-keys');
  return response.data;
}

export async function saveApiKeys(keys: Record<string, any>) {
  const response = await apiClient.post('/api/settings/api-keys', keys);
  return response.data;
}
