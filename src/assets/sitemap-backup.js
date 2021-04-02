const nodemon = require('nodemon').on('restart', function () {
    db.destroyConnection();
});
const db = require('./server');
const config = require('./config');
const fs = require('fs');
const {
    showTime,
    showError,
    log
} = require('./logger');

var schedule = {
    serverStartedTime: new Date().getTime(),
    lastTriggeredTime: null,
    nextTriggerTime: null,
}

schedule.lastTriggeredTime = schedule.serverStartedTime;
schedule.nextTriggerTime = new Date().setDate(new Date(schedule.serverStartedTime).getDate() + config.changeFrequecyInDays);
// schedule.nextTriggerTime = new Date().setMilliseconds(new Date(schedule.serverStartedTime).getMilliseconds() + 1000 * 10);

// Trigger On start of server
start();

// Checks every 12hrs
setInterval(function () {
    const currTime = new Date().getTime();
    showTime('Current time', currTime);
    showTime('Trigger time', schedule.nextTriggerTime);
    log('--------------------------------------------------------------------------');

    if (schedule.nextTriggerTime < currTime) {
        schedule.nextTriggerTime = new Date().setDate(new Date(schedule.serverStartedTime).getDate() + config.changeFrequecyInDays);
        schedule.lastTriggeredTime = currTime;
        log('Restarted...');
        start();
    }
}, 1000); // * 60 * 60 * 12); // 12 hrs

function start() {
    db.destroyConnection();
    showTime('Auto sitemap ganeration process started at', schedule.lastTriggeredTime);

    db.getConnection((err, con) => {
        if (err) {
            log(new Error(err));
            db.destroyConnection();
            return;
        }

        db.getAllJobs((err, res, fields) => {
            const jobs = Object.values(JSON.parse(JSON.stringify(res)));
            generateSitemap(jobs);
        });
    });
}

function generateSitemap(jobs) {
    // log(jobs);

    if (jobs.length > 0) {
        let urls = '';
        jobs.forEach(job => {
            urls += `<url>
                        <loc>${config.url}/${job.jobId}</loc>
                        <changefreq>${config.changeFrequecy}</changefreq>
                    </url>`;
        });

        let xmlFormat = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`;

        // log(xmlFormat);

        // create xml
        createFile("sitemap-jobs.xml", xmlFormat, () => {
            // change folder permission to 777


            // delete the file from 1ajob folder


            // copy new file to 1ajob folder
            const src = './',
                dest = config.xmlFolder;
            // copyFile(src, dest)
        });
    }
}

function createFile(name, data, callback) {
    fs.writeFile(name, data, function (err) {
        if (err) return showError(err);
        log(name + ' generated');
        callback();
    });
}

function deleteFile() {
    fs.deleteFile()
}

function copyFile(src, dest, callback) {
    fs.copyFile(src, dest, (err) => {
        if (err) return showError(err);
        log("XML File copied to " + dest + " folder");
        callback();
    });
}

// send mail to all if sitemap generation fail

module.exports = {
    schedule,
    showTime
};