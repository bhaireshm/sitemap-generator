const nodemon = require('nodemon').on('restart', function () {
    db.destroyConnection();
});
const nodeScheduler = require('node-schedule');
const fs = require('fs');

const db = require('./server');
const config = require('./config');
const {
    showTime,
    showError,
    log
} = require('./logger');

var timeSchedule = {
    serverStartedTime: new Date().setMilliseconds(new Date().getMilliseconds() + 1000),
    lastTriggeredTime: null,
    nextTriggerTime: null,
    cron: config.cron
}

timeSchedule.lastTriggeredTime = timeSchedule.serverStartedTime;
timeSchedule.nextTriggerTime = new Date().setDate(new Date(timeSchedule.serverStartedTime).getDate() + config.changeFrequecyInDays);

// Initial start
start();

const job = nodeScheduler.scheduleJob(timeSchedule.cron, function (fireDate) {
    const currTime = new Date(fireDate).getTime();
    timeSchedule.lastTriggeredTime = currTime;
    timeSchedule.nextTriggerTime = new Date(currTime).setDate(new Date(currTime).getDate() + config.changeFrequecyInDays);

    start();
});

function start() {
    showTime('Cron Job triggered at', timeSchedule.lastTriggeredTime);
    log('---------------------------------------------------------------------------------');

    db.getConnection((err, con) => {
        if (err) {
            log(new Error(err));
            db.destroyConnection();
            return;
        }

        db.getAllJobs((err, res, fields) => {
            const jobs = Object.values(JSON.parse(JSON.stringify(res)));
            generateSitemap(jobs);

            // all tasks completed closing db connection
            // db.endConnection();

            showTime("Next Triggers's at", timeSchedule.nextTriggerTime);
            log('---------------------------------------------------------------------------------');
        });
    });
}

function generateSitemap(jobs) {
    if (jobs.length > 0) {
        let urls = '',
            modifiedDate = new Date().toISOString().substr(0, 10);

        jobs.forEach(job => {
            urls += `<url>
                        <loc>${config.url}/${job.jobId}?${job.jobTitle.replace(/\s/g, '+')}</loc>
                        <lastmod>${modifiedDate}</lastmod>
                        <changefreq>${config.changeFrequecy}</changefreq>
                    </url>`;
        });

        let xmlFormat = `
        <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${urls}</urlset>`;

        // log(xmlFormat);

        // create xml
        createFile("jobs-sitemap.xml", xmlFormat);
    }
}

function createFile(name, data) {
    fs.writeFile(name, data, function (err) {
        if (err) return showError(err);
        log(name + ' generated');

        // Copy Files
        copyFiles();
    });
}

function copyFiles() {
    const exec = require('child_process').exec;
    const shellScript = exec('sh copy-sitemap.sh');
    shellScript.stdout.on('data', (data) => {
        log("FILE COPIED ", data);
    });
    shellScript.stderr.on('data', (data) => {
        log("FILE COPY FAILED ", data);
    });
}

// send mail to all if sitemap generation fail

module.exports = {
    schedule: timeSchedule,
    showTime
};