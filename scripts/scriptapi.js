const { default: mongoose } = require("mongoose");
const Assignment = require("../models/assignment.model");
const { eventNames } = require("../models/course.model");
const course_id = "69014918d028d66bf33dd63d";
const user_id = "69012023667857dbdefc10ff";
const title = "ass";
require("dotenv").config();
 (async () =>
  mongoose
    .connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(()=>async () =>
      Assignment.insertMany([
        {
          course_id,
          title: "ass1",
          desription: "def",
          created_by: user_id,
        },
        {
          course_id,
          title: "ass2",
          desription: "def",
          created_by: user_id,
        },
        {
          course_id,
          title: "ass3",
          desription: "def",
          created_by: user_id,
        },
        {
          course_id,
          title: "ass4",
          desription: "def",
          created_by: user_id,
        },
        {
          course_id,
          title: "ass5",
          desription: "def",
          created_by: user_id,
        },
      ])
    )
    .finally(mongoose.disconnect()))();
