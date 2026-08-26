export const paymentApi = {
  processPayment: async ({ amount, method, buyerName }) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          amount,
          method,
          buyerName,
          receipt: `PAY-${Date.now()}`,
          message: 'Payment Successful',
        })
      }, 650)
    })
  },
}
