var con

//region Get
/**
 * Get payment methods from database
 * @returns {Array} An array of payment method objects
 */
function getMethods() {
    return new Promise(async (fulfill, reject) => {
        try {
            var [res] = await con.query(`SELECT * FROM Payment`)

            if (res.length > 0) {
                fulfill(mapDBpaymentToObject(res))
            } else {
                fulfill(null)
            }
        } catch(ex) {
            reject(ex)
            return false
        }
    })
}

/**
 * Gets payment methods filtered by provided ID's
 * @param paymentMethodIDs The payment method ID's to filter on
 * @returns {Array} An array of payment method objects
 */
function getPaymentMethodsByIDs(paymentMethodIDs) {
    return new Promise(async (fulfill, reject) => {
        try {
            var [res] = await con.query(`SELECT * FROM Payment 
                                            WHERE ID IN (?)`, [paymentMethodIDs])

            if (res.length > 0) {
                fulfill(mapDBpaymentToObject(res))
            } else {
                fulfill(null)
            }
        } catch(ex) {
            reject(ex)
            return false
        }
    })
}

//endregion

//region Add

//endregion

//region Modify

//endregion

//region Delete
//endregion

//Helpers
function mapDBpaymentToObject(dbPaymentObject) {
    return dbPaymentObject.map((method) => {
        return {
            id: method.ID,
            name: method.payment_name,
            abbriviation: method.abbriv,
            shortDescription: method.short_desc,
            flatFee: method.flat_fee,
            percentageFee: method.percentage_fee,
            lastUpdated: method.lastUpdated
        }
    })
}

module.exports = {
    getMethods,
    getPaymentMethodsByIDs,

    setup: (dbPool) => { con = dbPool }
}