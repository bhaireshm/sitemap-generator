const chalk = require('chalk');
const db = "DATABASE: ";
const logger = "LOGGER  : ";

function showError(msg) {
    const err = new Error(msg);
    console.error(chalk.bgWhite.black(db), chalk.red(msg));
    return err;
}

function log(msg) {
    console.log(chalk.bold(logger), chalk.yellow(msg));
}

function showTime(s, t) {
    console.log(chalk.bold(logger), chalk.cyan(`${s} : ${new Date(t).toString()}`));
}

module.exports = {
    showError,
    showTime,
    log
}