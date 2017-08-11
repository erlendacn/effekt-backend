const decimal = require('big-decimal')

module.exports = {
    toPercent: function(input, decimals) {
        let total = input.reduce((acc, elem) => acc += elem, 0)
        let result = []

        for (let i = 0; i < input.length; i++) {
            result[i] = (input[i] / total) * 100
            if (typeof decimals !== "undefined") result[i] = Math.round(result[i] * Math.pow(10, decimals)) / Math.pow(10, decimals)
        }

        let houndred = new decimal('100')
        let current = new decimal(this.sumWithPrecision(result).toString())
        var remainder = houndred.subtract(current)

        if (remainder != 0) result[result.length-1] = parseFloat(remainder.add(new decimal(result[result.length-1].toString())).toString())

        return result
    },

    sumWithPrecision: function(input) {
        let total = new decimal('0')
        for (let i = 0; i < input.length; i++) {
            total = total.add(new decimal(input[i].toString()))
        }

        return parseFloat(total.toString())
    }
}