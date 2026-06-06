// Vite inyecta de forma automática las variables de entorno mediante import.meta.env
// En desarrollo leerá http://localhost:3000, en producción la URL de tu backend desplegado.
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const recovenApi = {
  async post(endpoint, data) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP Error ${response.status}`);
    }

    return await response.json();
  },

  async get(endpoint) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }

    return await response.json();
  },
};
