const dotenv = require('dotenv');
dotenv.config();
module.exports = {
    host: process.env.HOST,
    port: process.env.PORT,
    user: process.env.USER,
    password: process.env.PWD,
    schema: process.env.SCHEMA,
    url: process.env.URL,
    changeFrequecy: process.env.CHANGE_FREQUENCY,
    changeFrequecyInDays: Number(process.env.CHANGE_FREQUENCY_IN_DAYS),
    xmlFolder: process.env.XML_FOLDER
}