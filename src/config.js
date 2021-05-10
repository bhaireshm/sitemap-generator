const dotenv = require("dotenv").config();

const config = {
  host: process.env.SITEMAP_DB_HOST,
  port: process.env.SITEMAP_DB_PORT,
  user: process.env.SITEMAP_DB_USER_NAME,
  password: process.env.SITEMAP_DB_PASSWORD,
  schema: process.env.SITEMAP_DB_SCHEMA,
  url: process.env.SITEMAP_SITEMAP_URL,
  changeFrequecy: process.env.SITEMAP_CHANGE_FREQUENCY,
  changeFrequecyInDays: +process.env.SITEMAP_CHANGE_FREQUENCY_IN_DAYS,
  cron: process.env.SITEMAP_CRON,
};

module.exports = config;
