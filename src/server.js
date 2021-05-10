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
    if (err.code !== "PROTOCOL_CONNECTION_LOST") throw err;
    console.log("Re-connecting lost connection: " + err.stack);
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
  executeQuery(
    `SELECT id as jobId, job_title as jobTitle from ${config.schema}.job`,
    callback
  );
}

module.exports = {
  getConnection,
  endConnection,
  // destroyConnection,
  executeQuery,
  getAllJobs,
  handleDisconnect,
};
