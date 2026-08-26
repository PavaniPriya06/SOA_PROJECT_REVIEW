import { mockAuctions } from '../data/mockAuctions'

export const auctionApi = {
  getAuctions: async () => {
    return new Promise((resolve) => {
      setTimeout(() => resolve(mockAuctions), 300)
    })
  },

  getAuctionById: async (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const item = mockAuctions.find((auction) => auction.id === id)
        resolve(item || null)
      }, 250)
    })
  },

  createAuction: async (payload) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const auction = {
          id: payload.productName.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
          productName: payload.productName,
          description: payload.description,
          category: payload.category,
          image: payload.image || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
          images: [
            payload.image || 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1200&q=80',
          ],
          startingPrice: Number(payload.startingPrice),
          currentBid: Number(payload.startingPrice),
          bidCount: 0,
          startTime: Date.now(),
          endTime: new Date(payload.endDate).getTime(),
          status: 'LIVE',
          seller: 'Current Seller',
          bidHistory: [],
          specs: ['Seller provided item', 'Fresh listing', 'Ready for bidding'],
        }
        resolve(auction)
      }, 400)
    })
  },
}
