var Lab = require('lab')
var Code = require('code')

var lab = exports.lab = Lab.script()
var describe = lab.describe
var before = lab.before
var test = lab.test
var expect = Code.expect

var si = require('seneca')()

describe('run suite tests', function () {
  before({}, function (done) {
    si.use('../constants/constants.js')
    si.use('../service/suite/run_suite.js')
    si.ready(function (err) {
      if (err) return process.exit(!console.error(err))
      done()
    })
  })

  test('some test', function (done) {
    done(err)
  })

})
