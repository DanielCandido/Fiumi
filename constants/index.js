require("dotenv").config();

const API_TOKEN = process.env.API_TOKEN;
const API_URL = process.env.API_URL;
const API_HOST = process.env.API_HOST;

module.exports = { API_TOKEN, API_URL, API_HOST };
