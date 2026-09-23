import { apiClient, getApiErrorMessage } from './apiClient'

export const biddingApi = {
  placeBid: async ({ auctionId, amount, bidderName }) => {
    try {
      const { data } = await apiClient.post('/bids', {
        auctionId: Number(auctionId),
        bidderId: String(bidderName),
        bidAmount: Number(amount),
        bidTime: new Date().toISOString().slice(0, 19),
      })
      return data
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Bid placement failed.'))
    }
  },

  getBidsByAuctionId: async (auctionId) => {
    const { data } = await apiClient.get(`/bids/auction/${auctionId}`)
    return data
  },
}
