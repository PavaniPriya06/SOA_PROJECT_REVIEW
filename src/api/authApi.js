import axios from 'axios'

const mockUsers = [
  {
    id: 'user-1',
    name: 'Kiran Sharma',
    email: 'kiran@example.com',
    password: 'demo123',
  },
]

export const authApi = {
  login: async ({ email, password }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = mockUsers.find(
          (entry) => entry.email === email && entry.password === password,
        )

        if (user) {
          resolve({
            user: {
              id: user.id,
              name: user.name,
              email: user.email,
              totalBids: 18,
              auctionsWon: 3,
              totalSpent: 245000,
            },
            token: 'mock-jwt-token',
          })
        } else {
          reject(new Error('Invalid email or password.'))
        }
      }, 500)
    })
  },

  register: async ({ name, email, password }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockUsers.push({ id: `user-${Date.now()}`, name, email, password })
        resolve({
          user: {
            id: `user-${Date.now()}`,
            name,
            email,
            totalBids: 0,
            auctionsWon: 0,
            totalSpent: 0,
          },
          token: 'mock-jwt-token',
        })
      }, 600)
    })
  },

  getCurrentUser: async () => {
    const storedUser = JSON.parse(localStorage.getItem('bidvelocity-user') || 'null')
    return storedUser || null
  },
}

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 5000,
})
