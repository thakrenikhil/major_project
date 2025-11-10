const courseModel = require("../models/course.model");

const courseStart = async () => {
  let today = Date.now();
  let yesterday = Date.now() - 1;
  let courses = courseModel.updateMany(
    {
      start_date: {
        $lte: today,
        $gt: yesterday,
      },
      status: "APPROVED",
    },
    {
      $set: { status: "IN_PROGRESS" },
    }
  );
};
module.exports = {
  scheduleString: "5 0 * * *",
  courseStart,
};
