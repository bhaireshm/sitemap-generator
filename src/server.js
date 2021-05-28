const config = require("./config");
const { dbErrorLog, log } = require("./logger");

const mysql = require("mysql2");
const pool = mysql.createPool({
  // connectTimeout: 1000 * 60,
  // debug: true,
  connectionLimit: 100,
  host: config.host,
  user: config.user,
  port: config.port,
  password: config.password,
  database: config.schema,
});
var conn;

// conn.connect((err) => {
//   if (err) return dbErrorLog(err);
//   log("DB Connected.");
// });

function getConnection(callback) {
  log("Connecting...");

  pool.getConnection(function (err, connection) {
    if (err) {
      return callback(err);
    }
    // callback(err, conn);
    conn = connection;
    log("DB Connected.");

    executeQuery(`use ${config.schema}`, (err, res) => {
      if (err) return dbErrorLog(err);
      log(`Using "${config.schema}" database.`);
      callback(err, conn);
    });

    handleDisconnect(callback);
  });
}

function handleDisconnect(callback) {
  conn.on("error", function (err) {
    if (!err.fatal) return;
    // if (err.code !== "PROTOCOL_CONNECTION_LOST") throw err;
    console.log("Re-connecting lost connection: " + err.stack);
    throw err;
    // conn = mysql.createConnection(conn.config);
    // handleDisconnect(conn);
    // conn.connect((err) => {
    //   if (err) return callback(dbErrorLog(err));
    //   log("DB Connected.");
    // });
  });
}

function endConnection() {
  if (conn) {
    conn.release(function (err) {
      log(err);
      pool.end();
    });
  }
}

// function destroyConnection() {
//   if (conn) {
//     conn.releaseConnection(function () {
//       log("DB Connection destroyed.");
//     });
//   }
// }

function executeQuery(query, callback) {
  if (!query) return callback(dbErrorLog("Query is required"));
  conn.query(query, function (err, res, fields) {
    if (err) return dbErrorLog(err);
    callback(err, res, fields);
  });
}

function getAllJobs(callback) {
  // const removeDelistedJobs = `INNER JOIN ${config.schema}.job_application ja ON j.id = ja.job_id AND ja.status_id != 11`;
  // const query = `SELECT DISTINCT j.id AS jobId, j.job_title AS jobTitle FROM ${config.schema}.job AS j ${removeDelistedJobs}`;

  const query = `SELECT DISTINCT ja.job_id AS jobId, j.job_title AS jobTitle 
                  FROM ${config.schema}.job_application AS ja JOIN ${config.schema}.job AS j 
                  ON j.id = ja.job_id WHERE ja.status_id != 11`;

  executeQuery(query, callback);
}

module.exports = {
  getConnection,
  endConnection,
  // destroyConnection,
  executeQuery,
  getAllJobs,
  handleDisconnect,
};
