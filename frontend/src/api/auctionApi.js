import { apiClient, getApiErrorMessage } from './apiClient'

const statusMap = {
  ACTIVE: 'LIVE',
  UPCOMING: 'UPCOMING',
  ENDED: 'ENDED',
  CLOSED: 'ENDED',
}

const toTimestamp = (value) => {
  const timestamp = new Date(value).getTime()
  return Number.isNaN(timestamp) ? Date.now() : timestamp
}

export const normalizeBid = (bid = {}) => ({
  bidder: bid.bidderId ?? bid.bidder ?? '',
  bidderId: bid.bidderId ?? bid.bidder ?? '',
  amount: Number(bid.bidAmount ?? bid.amount ?? 0),
  time: bid.bidTime ? new Date(bid.bidTime).toLocaleString() : 'Just now',
})

export const normalizeAuction = (auction = {}, bids = []) => {
  const normalizedBids = bids.map(normalizeBid)
  const startingPrice = Number(auction.startingPrice ?? 0)
  const highestBid = normalizedBids.reduce(
    (highest, bid) => Math.max(highest, bid.amount),
    Number(auction.winningBidAmount ?? startingPrice),
  )

  const imagePath = auction.image ?? auction.images?.[0] ?? ''
  const image = imagePath && imagePath.startsWith('/')
    ? new URL(imagePath, apiClient.defaults.baseURL).toString()
    : imagePath

  return {
    ...auction,
    id: auction.auctionId ?? auction.id,
    productName: auction.itemName ?? auction.productName ?? 'Auction item',
    startingPrice,
    currentBid: highestBid,
    bidCount: normalizedBids.length,
    bidHistory: normalizedBids,
    startTime: toTimestamp(auction.startTime),
    endTime: toTimestamp(auction.endTime),
    status: statusMap[auction.status] || auction.status || 'UPCOMING',
    sellerId: auction.sellerId,
    category: auction.category || 'Uncategorized',
    description: auction.description || 'Auction item details are not available.',
    image,
    images: image ? [image] : [],
  }
}

const getBids = async (auctionId) => {
  try {
    const { data } = await apiClient.get(`/bids/auction/${auctionId}`)
    return Array.isArray(data) ? data : []
  } catch {
    // Auction data remains usable when the optional bid-history service is unavailable.
    return []
  }
}

const withBids = async (auction) => normalizeAuction(auction, await getBids(auction.auctionId ?? auction.id))

export const auctionApi = {
  getAuctions: async () => {
    try {
      const { data } = await apiClient.get('/auctions')
      return Promise.all(data.map(withBids))
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to load auctions.'))
    }
  },

  getAuctionById: async (id) => {
    try {
      const { data } = await apiClient.get(`/auctions/${id}`)
      return withBids(data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to load this auction.'))
    }
  },

  createAuction: async (payload) => {
    try {
      const auction = {
        itemName: payload.productName,
        startingPrice: Number(payload.startingPrice),
        startTime: payload.startTime,
        endTime: payload.endTime,
        sellerId: String(payload.sellerId),
      }
      const request = payload.imageFile
        ? (() => {
            const formData = new FormData()
            formData.append('auction', new Blob([JSON.stringify(auction)], { type: 'application/json' }))
            formData.append('image', payload.imageFile)
            return formData
          })()
        : auction
      const { data } = await apiClient.post('/auctions', request)
      return normalizeAuction(data)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to create auction.'))
    }
  },

  startAuction: async (id) => {
    const { data } = await apiClient.put(`/auctions/${id}/start`)
    return withBids(data)
  },

  closeAuction: async (id) => {
    const { data } = await apiClient.put(`/auctions/${id}/close`)
    return withBids(data)
  },
}
