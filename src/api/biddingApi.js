export const biddingApi = {
  placeBid: async ({ auctionId, amount, bidderName }) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!auctionId || amount <= 0) {
          reject(new Error('Please provide a valid bid amount.'))
          return
        }

        resolve({
          success: true,
          auctionId,
          amount,
          bidderName,
          message: 'Bid placed successfully.',
        })
      }, 350)
    })
  },
}
