const config = require("./config");
const { showError, log } = require("./logger");

const mysql = require("mysql");
const conn = mysql.createConnection({
  connectTimeout: 1000 * 60,
  debug: true,
  host: config.host,
  user: config.user,
  port: config.port,
  password: config.password,
  database: config.schema,
});

conn.connect((err) => {
  if (err) return callback(showError(err));
  log("DB Connected.");
});

function getConnection(callback) {
  log("Connecting...");

  executeQuery(`use ${config.schema}`, (err, res) => {
    if (err) return showError(err);
    log(`Using "${config.schema}" database.`);
    callback(err, conn);
  });

  handleDisconnect(callback);
}

function handleDisconnect(callback) {
  conn.on("error", function (err) {
    if (!err.fatal) return;
    if (err.code !== "PROTOCOL_CONNECTION_LOST") throw err;
    console.log("Re-connecting lost connection: " + err.stack);
    conn = mysql.createConnection(conn.config);
    handleDisconnect(conn);
    conn.connect((err) => {
      if (err) return callback(showError(err));
      log("DB Connected.");
    });
  });
}

function endConnection() {
  if (conn) {
    conn.end(function (err) {
      log(err);
    });
  }
}

function destroyConnection() {
  if (conn) {
    conn.destroy(function () {
      log("DB Connection destroyed.");
    });
  }
}

function executeQuery(query, callback) {
  if (!query) return callback(showError("Query is required"));
  conn.query(query, function (err, res, fields) {
    if (err) return showError(err);
    callback(err, res, fields);
  });
}

function getAllJobs(callback) {
  executeQuery(
    `SELECT id as jobId, job_title as jobTitle from ${config.schema}.job`,
    callback
  );
}

module.exports = {
  getConnection,
  endConnection,
  destroyConnection,
  executeQuery,
  getAllJobs,
  handleDisconnect,
};
