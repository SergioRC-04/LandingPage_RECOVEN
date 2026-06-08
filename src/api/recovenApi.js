// recovenApi.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
}

function handleSessionExpired() {
  localStorage.removeItem("token");
  window.dispatchEvent(
    new window.CustomEvent("session-expired", {
      detail: { message: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente." },
    })
  );
}

async function handleResponse(response, returnBlob = false, requiresAuth = false) {
  // Solo si la petición requería autenticación y recibimos 401 → sesión expirada
  if (requiresAuth && response.status === 401) {
    handleSessionExpired();
    throw new Error("SESION_EXPIRADA");
  }
  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorData = await response.json();
      errorMsg = errorData.message || errorMsg;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }
  return returnBlob ? await response.blob() : await response.json();
}

export const recovenApi = {
  async post(endpoint, data, requiresAuth = false) {
    const headers = { "Content-Type": "application/json", Accept: "application/json" };
    if (requiresAuth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response, false, requiresAuth);
  },

  async get(endpoint, requiresAuth = false) {
    const headers = { Accept: "application/json" };
    if (requiresAuth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, { method: "GET", headers });
    return handleResponse(response, false, requiresAuth);
  },

  async put(endpoint, data, requiresAuth = true) {
    const headers = { "Content-Type": "application/json" };
    if (requiresAuth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response, false, requiresAuth);
  },

  async delete(endpoint, data, requiresAuth = true) {
    const headers = { "Content-Type": "application/json" };
    if (requiresAuth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "DELETE",
      headers,
      body: JSON.stringify(data),
    });
    return handleResponse(response, false, requiresAuth);
  },

  async getBlob(endpoint, requiresAuth = true) {
    const headers = {};
    if (requiresAuth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, { method: "GET", headers });
    return handleResponse(response, true, requiresAuth);
  },
};
