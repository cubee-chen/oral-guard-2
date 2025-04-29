// single place that knows where the API lives
export const API_HOST =
  import.meta.env.VITE_API_URL?.replace(/\/+$/, '') || 'http://localhost:5000';
