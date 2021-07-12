
const axios = require('axios');

const api = axios.create({
    baseURL: process.env.ZENDESK_URL,
    auth: {
        username: process.env.ZENDESK_USERNAME,
        password: process.env.ZENDESK_PASSWORD
      }
})

module.exports = api;