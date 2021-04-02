const config = require('./config');
const {
    showError,
    log
} = require('./logger');

const conn = require('mysql').createConnection({
    connectTimeout: 1000 * 60,
    debug: true,
    host: config.host,
    user: config.user,
    port: config.port,
    password: config.password,
    database: config.schema
});

function getConnection(callback) {
    conn.connect((err) => {
        log("Connecting...");
        if (err) return callback(showError(err));
        log('DB Connected.');
        executeQuery(`use ${config.schema}`, (err, res) => {
            if (err) return showError(err);
            log(`Using "${config.schema}" database.`);
            callback(err, conn);
        });
    });

    conn.on('error', function (err) {
        showError(err);
        destroyConnection();
        if (err.code === 'PROTOCOL_CONNECTION_LOST') getConnection();
    });
}

function destroyConnection() {
    if (conn) {
        conn.destroy(function () {
            log("DB Connection destroyed.");
        });
    }
}

function executeQuery(query, callback) {
    if (!query) return callback(showError('Query is required'));
    conn.query(query, function (err, res, fields) {
        if (err) return showError(err);
        callback(err, res, fields);
    })
}

function getAllJobs(callback) {
    executeQuery(`SELECT id as jobId, job_title as jobTitle from ${config.schema}.job`, callback);
}

module.exports = {
    getConnection,
    destroyConnection,
    executeQuery,
    getAllJobs
}