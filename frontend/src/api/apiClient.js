import axios from 'axios'

const configuredApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (!configuredApiBaseUrl && !import.meta.env.DEV) {
  throw new Error('VITE_API_BASE_URL is required for production deployments.')
}

export const API_BASE_URL = configuredApiBaseUrl || 'http://localhost:8080'
export const TOKEN_STORAGE_KEY = 'bidvelocity_token'
export const USER_STORAGE_KEY = 'bidvelocity_current_user'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_STORAGE_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

export const getApiErrorMessage = (error, fallback = 'Something went wrong. Please try again.') => (
  error.response?.data?.message || error.response?.data?.error || error.message || fallback
)