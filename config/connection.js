const mongoose = require('mongoose');

const state = {
  db: null,
};

module.exports.connect = function () {
  mongoose.connect('mongodb://localhost:27017/sms');

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', function () {
    console.log('Connected to the database');
    state.db = db;
  });
};

module.exports.get = function () {
  return state.db;
};
