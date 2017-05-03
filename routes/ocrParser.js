const express = require('express')
const router = express.Router()
const OCR = require('../custom_modules/OCR.js')

const Donation = require('../models/donation.js')

const fileUpload = require('express-fileupload')

const ORCParser = new OCR()

router.post('/', (req, res) => {
    console.log(req.files)

    var data = req.files.ocr.data.toString('UTF-8')

    var parsedData = ORCParser.parse(data)

    var dataForDonationRegistration = parsedData.map((elem) => {
        return {
            KID: elem.KID,
            amount: elem.amount
        }
    })

    Donation.registerDonationsFromOCR(dataForDonationRegistration, (err, donations) => {
        if (err) console.log(err)
        else console.log(donations)
    })

    res.json({
        status: 200,
        content: dataForDonationRegistration
    })
})

module.exports = router