const DAO = require('./DAO.js')
const config = require('../config')
const mail = require('./mail.js')

module.exports = {
  /**
   * @typedef InvalidTransaction
   * @property {string} reason 
   * @property {Transaction} transaction 
   */

  /**
   * @typedef AddDonationsResult
   * @property {number} valid 
   * @property {number} invalid
   * @property {Array<InvalidTransaction>} invalidTransactions 
   */

  /**
   * Adds transactions parced from OCR to the database
   * @param {Array<import('./parsers/OCR.js').OCRTransaction>} transactions 
   * @param {number} metaOwnerID 
   * @returns {AddDonationsResult}
   */
  async addDonations(transactions, metaOwnerID) {
    const tasks = transactions.map(transaction => this.addDonation(transaction, metaOwnerID))

    //Add in paralell
    const results = await Promise.allSettled(tasks)

    const valid = results.filter(result => result.status === 'fulfilled' && result.value === true).length
    const invalidTransactions = results.filter(result => result.status === 'fulfilled' && result.value !== true).map(result => result.value)
    const failed = results.filter(result => result.status === 'rejected')

    for (let i = 0; i < failed.length; i++) {
      console.error(`Failed to add OCR donation`)
      console.errror(failed[i].reason)
    }

    return {
      valid,
      invalid: invalidTransactions.length,
      invalidTransactions
    }
  },
  
  /**
   * Adds transactions parced from OCR to the database
   * @param {Array<import('./parsers/OCR.js').OCRTransaction>} transactions 
   * @param {number} metaOwnerID 
   * @returns {{ valid: number, invalid: number: invalidTransactions: Array<> }}
   */
  async addDonation(transaction, metaOwnerID) {
    try {
      let donationID = await DAO.donations.add(transaction.KID, transaction.paymentMethod, transaction.amount, transaction.date, transaction.transactionID, metaOwnerID)
      valid++
      if (config.env === 'production') await mail.sendDonationReciept(donationID)
      return true
    } catch (ex) {
      //Only return a failed if it failed because the donation exists
      if (ex.message.indexOf("EXISTING_DONATION") == -1) {
        return {
            reason: ex.message,
            transaction
        }
      }
    }
  }
}