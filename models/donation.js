const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DonationSplit = require('./donationSplit.js')

const DonationSchema = new Schema({
  amount: {
    type: Number,
    required: true
  },
  KID: {
    type: Number,
    minlength: 8,
    maxlength: 8
  },
  registered: {
    type: Date,
    default: Date.now()
  },
  verified: {
    type: Boolean
  },
  split: {
    type: [DonationSplit],
    validate: [(v) => { 
      return (v.reduce((acc, elem, i) => acc + elem.share, 0) == 100)
    }, 'Donation shares do not add up to 100']
  }
})

/*
OCRDonations should be on the following format:

[{
    KID: 12345674,
    amount: 2000
}]
*/

DonationSchema.statics.registerDonationsFromOCR = (OCRdonations, cb) => {
    model.find({
        KID: {
            $in: OCRdonations.map((donation) => donation.KID)
        }
    }).exec((err, donations) => {
        if (err) return cb(err)
        cb(null, donations)
    })
}

DonationSchema.statics.getDonationByUser = (userID, cb) => {
  model.find({
    ownerID: userID
  }).exec((err, donations) => {
    if (err) return cb(err)
    cb(null, donations)
  })
}

DonationSchema.statics.getAggregatedDonationsByUser = (userID, fromDate, toDate, cb) => {
  Donation.aggregate([
    {
      $match: {
        ownerID: userID,
        registered: { 
          $gte: fromDate,
          $lt: toDate
        }
      }
    }
  ], (err, donations) => {
    
  })
}

DonationSchema.statics.getTotalAggregatedDonations = (from, to, cb) => {
  model.aggregate([
    {
      $match: {
        verified: true,
        registered: { 
          $gte: from,
          $lt: to
        }
      }
    },
    {
      $project: {
        split: 1,
        amount: 1
      }
    },
    {
      $unwind: "$split"
    },
    {
      $project: {
        result: {
          $multiply: ["$amount", "$split.share", 0.01] //0.01 to change from % to to 0-1
        },
        organizationID: "$split.organizationID"
      }
    },
    {
      $group: {
        _id: "$organizationID",
        sum: {
          $sum: "$result"
        }
      }
    }
  ], (err, result) => {
    if (err) return cb(err)
    return cb(null, result)
  })
}

const model = mongoose.model('Donation', DonationSchema, 'donations')

module.exports = model