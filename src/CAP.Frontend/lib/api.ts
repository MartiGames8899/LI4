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

export async function downloadFile(endpoint: string, filename: string, onProgress?: (state: 'loading' | 'done' | 'error') => void) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('cap_token') : null;

  onProgress?.('loading');
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      let serverMessage = '';
      try {
        const txt = await response.text();
        if (txt) {
          try {
            const parsed = JSON.parse(txt);
            serverMessage = parsed.message || parsed.title || txt;
          } catch {
            serverMessage = txt;
          }
        }
      } catch {}

      if (response.status === 401) {
        throw new Error('Sessão expirada. Por favor, inicia sessão novamente.');
      }
      if (response.status === 403) {
        throw new Error('Não tens permissão para descarregar este relatório.');
      }
      throw new Error(serverMessage || `Erro ao descarregar ficheiro (HTTP ${response.status})`);
    }

    const blob = await response.blob();
    if (blob.size === 0) {
      throw new Error('O ficheiro recebido está vazio.');
    }

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    onProgress?.('done');
  } catch (e) {
    onProgress?.('error');
    throw e;
  }
}
