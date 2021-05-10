const chalk = require("chalk");
const db = "[DATABASE] ";
const logger = "[LOGGER]   ";

function errorLog(msg) {
  console.log(chalk.bold(logger), chalk.red(msg));
}

function dbErrorLog(msg) {
  console.log(chalk.bold(db), chalk.red(msg));
}

function log(msg) {
  console.log(chalk.bold(logger), chalk.yellow(msg));
}

function successLog(msg) {
  console.log(chalk.bold(logger), chalk.green(msg));
}

function showTime(s, t) {
  console.log(
    chalk.bold(logger),
    chalk.cyan(`${s} : ${new Date(t).toString()}`)
  );
}

module.exports = {
  errorLog,
  showTime,
  log,
  successLog,
  dbErrorLog,
};
