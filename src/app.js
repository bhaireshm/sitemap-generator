const nodeScheduler = require("node-schedule");
const fs = require("fs");
const db = require("./server");
const config = require("./config");

const nodemon = require("nodemon").on("restart", function () {
  db.endConnection();
});

const { showTime, errorLog, log, successLog } = require("./logger");

var timeSchedule = {
  serverStartedTime: new Date().setMilliseconds(
    new Date().getMilliseconds() + 1000
  ),
  lastTriggeredTime: null,
  nextTriggerTime: null,
  cron: config.cron, // "*/2 * * * *",
};

timeSchedule.lastTriggeredTime = timeSchedule.serverStartedTime;
timeSchedule.nextTriggerTime = new Date().setDate(
  new Date(timeSchedule.serverStartedTime).getDate() +
    config.changeFrequecyInDays
);

// Initial start
start();

const job = nodeScheduler.scheduleJob(timeSchedule.cron, function (fireDate) {
  const currTime = new Date(fireDate).getTime();
  timeSchedule.lastTriggeredTime = currTime;
  timeSchedule.nextTriggerTime = new Date(currTime).setDate(
    new Date(currTime).getDate() + config.changeFrequecyInDays
  );

  start();
});

function start() {
  log(
    "---------------------------------------------------------------------------------"
  );
  showTime("Cron Job triggered at", timeSchedule.lastTriggeredTime);

  db.getConnection((err, con) => {
    if (err) {
      log(new Error(err));
      db.endConnection();
      return;
    }

    db.getAllJobs((err, res, fields) => {
      const jobs = Object.values(JSON.parse(JSON.stringify(res)));
      generateSitemap(jobs);

      // all tasks completed closing db connection
      db.endConnection();

      showTime("Next Triggers's at", timeSchedule.nextTriggerTime);
    });
  });
}

function generateSitemap(jobs) {
  if (jobs.length > 0) {
    let urls = "",
      modifiedDate = new Date().toISOString().substr(0, 10);

    jobs.forEach((job) => {
      const jobTitle = job.jobTitle.replace(/\s/g, "+");
      const url = `${config.url}/${job.jobId}?${jobTitle}`;
      //   log("Added url: " + url);

      urls += `<url>
                <loc>${url}</loc><lastmod>${modifiedDate}</lastmod>
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
    if (err) return errorLog(err);
    successLog("File : " + name + " generated");
    successLog("Time : " + new Date().toString());

    // Copy Files
    copyFiles();
  });
}

function copyFiles() {
  const exec = require("child_process").exec;
  var shellScript;

  //   const os = require("os");
  //   if (os.type().startsWith("Windows")) shellScript = exec("copy-sitemap.bat");
  //   else
  shellScript = exec("sh copy-sitemap.sh");

  shellScript.stdout.on("data", (data) => {
    successLog("File : COPIED");
    shellScript.kill();
  });

  shellScript.stderr.on("data", (data) => {
    errorLog("File : COPY FAILED");
    shellScript.kill();
  });
}

// send mail to all if sitemap generation fail

module.exports = {
  schedule: timeSchedule,
  showTime,
};
