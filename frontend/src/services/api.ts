export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api/v1';
export const USE_MOCK_DATA = true; // Set to false when connecting to live FastAPI

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`API Error [${response.status}]: ${errorBody || response.statusText}`);
  }

  return response.json();
}
