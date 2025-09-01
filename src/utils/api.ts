// API utility functions with automatic cookie handling

interface ApiOptions extends RequestInit {
  body?: any;
}

export const apiFetch = async (path: string, options: ApiOptions = {}) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout
  
  try {
    const config: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    };

    if (config.body && typeof config.body === 'object') {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(path, config);
    clearTimeout(timeout);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.error?.message || `Errore HTTP ${response.status}`;
      throw new Error(message);
    }

    return response.json();
  } catch (e: any) {
    clearTimeout(timeout);
    const reason = e?.name === 'AbortError' ? 'timeout' : (e?.message || 'network');
    throw new Error(`Connessione al server non riuscita (${reason}).`);
  }
};

// Test API functions
export const createTest = async (data: { title?: string; description?: string } = {}) => {
  return apiFetch('/api/tests', {
    method: 'POST',
    body: data,
  });
};

export const getTest = async (id: string) => {
  return apiFetch(`/api/tests/${id}`);
};

export const getTestQuestions = async (id: string) => {
  return apiFetch(`/api/tests/${id}/questions`);
};

// Auth API functions
export const login = async (email: string, password: string) => {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  });
};

export const register = async (email: string, password: string, role?: string) => {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: { email, password, role },
  });
};

export const logout = async () => {
  return apiFetch('/api/auth/logout', {
    method: 'POST',
  });
};

export const getCurrentUser = async () => {
  return apiFetch('/api/auth/me');
};