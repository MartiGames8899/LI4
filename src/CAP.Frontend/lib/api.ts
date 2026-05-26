export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cap_token') : null;
  
  const headers = new Headers(options.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  
  // Only set Content-Type to application/json if it's not FormData
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && typeof window !== 'undefined') {
      // Token expirado ou inválido
      localStorage.removeItem('cap_token');
      localStorage.removeItem('cap_user');
      window.location.href = '/';
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
  }

  // Verifica se tem body
  if (response.status !== 204) {
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
  }
  
  return {} as T;
}
