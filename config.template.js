module.exports = {
  https: {
    port: 3000,

    // locations for SSL certificates
    certs: {
      key: "certs/sentinel-key.pem",
      cert: "certs/sentinel-cert.pem"
    }
  },

  // DB connections
  "db": {
    "name": "",
    "host": "",
    "port": 10054,
    "username": "",
    "password": "",
    "options": {
      "w": 1
    }
  },

  // mail configuration
  "mail": {
    "mail": {
      from: "contact@sentinel.com"
    },
    config: {
      host: "127.0.0.1",
      port: 25,
      ignoreTLS: true
    }
  }
}
