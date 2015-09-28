"use strict"

module.exports = function() {
  var error_codes = {
    ok: {
      code: "000",
      message: "Success"
    },
    not_auth: {
      code: "100",
      message: "Not Authorized"
    },
    processing_error: {
      code: "200",
      message: "Processing command error"
    },
    internal_error: {
      code: "300",
      message: "Internal server error"
    },
    protocol_invalid_type: {
      code: "401",
      message: "Invalid command type"
    }
  }

  return {
    name: 'protocol_v1',
    exportmap: {
      error_codes: error_codes
    }
  }
}