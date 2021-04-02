const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
    schema: process.env.DB_SCHEMA,
    url: process.env.SITEMAP_URL,
    changeFrequecy: process.env.CHANGE_FREQUENCY,
    changeFrequecyInDays: Number(process.env.CHANGE_FREQUENCY_IN_DAYS),
    xmlFolder: process.env.XML_FOLDER
}