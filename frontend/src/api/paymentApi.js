import { apiClient, getApiErrorMessage } from './apiClient'

export const paymentApi = {
  processPayment: async ({ auctionId, amount, bidderId }) => {
    try {
      const { data } = await apiClient.post('/payments', {
        auctionId: Number(auctionId),
        bidderId: String(bidderId),
        amount: Number(amount),
        paymentStatus: 'SUCCESS',
        paymentTime: new Date().toISOString().slice(0, 19),
      })
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Payment failed.'))
    }
  },

  getPaymentsByAuctionId: async (auctionId) => {
    const { data } = await apiClient.get(`/payments/auction/${auctionId}`)
    return data
  },
}
