import { apiClient, getApiErrorMessage, TOKEN_STORAGE_KEY, USER_STORAGE_KEY } from './apiClient'

const normalizeUser = (data = {}) => ({
  id: data.userId ?? data.id,
  name: data.username ?? data.name ?? '',
  email: data.email ?? '',
  role: data.role ?? 'USER',
  totalBids: 0,
  auctionsWon: 0,
  totalSpent: 0,
})

export const authApi = {
  login: async ({ email, password }) => {
    try {
      const { data } = await apiClient.post('/auth/login', {
        usernameOrEmail: email.trim(),
        password,
      })
      return { token: data.token, user: normalizeUser(data) }
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Invalid email or password.'))
    }
  },

  register: async ({ name, email, password }) => {
    try {
      const { data } = await apiClient.post('/auth/register', {
        username: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: 'USER',
      })
      return { token: data.token || null, user: normalizeUser(data) }
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Registration failed.'))
    }
  },

  getCurrentUser: async () => {
    try {
      return JSON.parse(localStorage.getItem(USER_STORAGE_KEY) || 'null')
    } catch {
      return null
    }
  },

  saveSession: ({ token, user }) => {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))
    localStorage.setItem('bidvelocity_authenticated', 'true')
  },

  clearSession: () => {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
    localStorage.removeItem('bidvelocity_authenticated')
  },
}
