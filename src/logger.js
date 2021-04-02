const logger = require('debug')('LOGGER');
const db_log = require('debug')('DATABASE');

function showError(msg) {
    const err = new Error(msg);
    db_log(err);
    return err;
}

function log(msg) {
    logger(msg);
}

function showTime(s, t) {
    logger(`${s} : ${new Date(t).toString()}`);
}

module.exports = {
    showError,
    showTime,
    log
}