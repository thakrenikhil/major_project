const courseModel = require("../models/course.model");

const courseCompletion = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const result = await courseModel.updateMany(
      {
        end_date: { $gte: today, $lt: tomorrow },
        status: "IN_PROGRESS",
      },
      { $set: { status: "COMPLETED" } }
    );

    console.log(`✅ ${result.modifiedCount} courses marked as COMPLETED`);
  } catch (err) {
    console.error("❌ Error updating course statuses:", err);
  }
};
let scheduleString = "5 0 * * *";
module.exports = {
  scheduleString,
  courseCompletion,
};
