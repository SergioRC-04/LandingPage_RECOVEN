// recovenApi.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function getToken() {
  return localStorage.getItem("token");
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }
    return await response.json();
  },

  async get(endpoint, requiresAuth = false) {
    const headers = { Accept: "application/json" };
    if (requiresAuth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, { method: "GET", headers });
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    return await response.json();
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
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }
    return await response.json();
  },

  async getBlob(endpoint, requiresAuth = true) {
    const headers = {};
    if (requiresAuth) {
      const token = getToken();
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, { method: "GET", headers });
    if (!response.ok) throw new Error(`HTTP Error ${response.status}`);
    return await response.blob();
  },
};
