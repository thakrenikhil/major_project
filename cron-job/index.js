const nodeCron = require("node-cron");
const {
  scheduleString: courseCompletionString,
  courseCompletion,
} = require("./courseCompletion.job.js");
const {
  scheduleString: courseStartString,
  courseStart,
} = require("./courseStart.job.js");

function jobs() {
  nodeCron.schedule(courseCompletionString, courseCompletion);
  nodeCron.schedule(courseStartString, courseStart);
  console.log("cron jobs are scheduled...");
}

module.exports = jobs;
