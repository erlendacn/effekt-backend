const reporting = require('../../custom_modules/reporting.js')
const dateRangeHelper = require('../../custom_modules/dateRangeHelper.js')
const DAO = require('../../custom_modules/DAO.js')
const moment = require('moment')

module.exports = async (req, res, next) => {
    try {
      let dates = dateRangeHelper.createDateObjectsFromExpressRequest(req)

      if (req.query.paymentMethodIDs) {
        try {
          var paymentMethodIDs = req.query.paymentMethodIDs.split('|').map(n => parseInt(n))
        } catch(ex) {
          res.json({
            status: 400,
            content: 'Failed to parse payment method IDs. Should be passed on the form int.int.int, e.g. 3|5|8'
          })
        }

        var paymentMethods = await DAO.payment.getPaymentMethodsByIDs(paymentMethodIDs)
        var donationsFromRange = await DAO.donations.getFromRange(dates.fromDate, dates.toDate, paymentMethodIDs)
      } else {
        var paymentMethods = await DAO.payment.getMethods()
        var donationsFromRange = await DAO.donations.getFromRange(dates.fromDate, dates.toDate)
      }
      
      if (req.query.filetype === "json") {
        res.json({
          status: 200,
          content: donationsFromRange
        })
      }
      else if (req.query.filetype === "excel") {
        let organizations = await DAO.organizations.getAll();
        let excelFile = reporting.createExcelFromIndividualDonations(donationsFromRange, organizations, paymentMethods)
  
        res.writeHead(200, {
          'Content-Type': 'application/vnd.ms-excel',
          'Content-disposition': 'attachment;filename=Individual_Donations_' + moment(dates.fromDate).format('YYYY-MM-DD') + '_to_' + moment(dates.toDate).format('YYYY-MM-DD') + '.xlsx',
          'Content-Length': excelFile.length
        });
        res.end(excelFile);
      } else {
        res.status(400).json({
          code: 400,
          content: "Please provide a query parameter 'filetype' with either excel or json as value"
        })
      }
    }
    catch(ex) {
      next({ex: ex})
    }
  }