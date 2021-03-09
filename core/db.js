const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;

mongoose.connection.on("error", (error) => console.log(error));
mongoose.Promise = global.Promise;

module.exports = { db, mongoose };
