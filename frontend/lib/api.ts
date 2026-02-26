import axios from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Inyectar Token de Sesión en cada petición
api.interceptors.request.use(async (config) => {
  const session = await getSession();

  const token = (session as any)?.accessToken || (session?.user as any)?.accessToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const scraperApi = {
  analyze: (url: string) => api.post('/scraper/analyze/', { url }),
  create: (data: any) => api.post('/scraper/', data),
  get: (id: string) => api.get(`/scraper/${id}/`),
};

export const endpointApi = {
  list: () => api.get('/endpoints/'),
  getMetadata: (slug: string) => api.get(`/endpoints/info/${slug}`),
  execute: (slug: string, limit: number = 10, fetchFullContent: boolean = false, waitTime: number = 2000) => 
    api.get(`/endpoints/scrape/${slug}?limit=${limit}&fetch_full_content=${fetchFullContent}&wait_time=${waitTime}`),
};

export const statsApi = {
  get: () => api.get('/stats/'),
};

export default api;
