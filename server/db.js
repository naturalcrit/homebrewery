const Mongoose = require('mongoose');
// TODO: should some config object be used here instead of hardcoging the URL?
const DB_URL = process.env.MONGODB_URI || process.env.MONGOLAB_URI || 'mongodb://localhost/homebrewery';

function errorHandler() {

}

function connectionResolver(resolve, reject) {
  Mongoose.connect(DB_URL,
  { retryWrites: false, useNewUrlParser: true },
  (error) => {
    if (error) {
      console.error('Could not connect to a Mongo Database.');
      console.error('If you are running locally, make sure mongodb.exe is running.');
      return reject();
    }

    return resolve();
  });
}

function disconnect() {
  return Mongoose.close();
}

function connect() {
  return new Promise(connectionResolver);
}

module.exports = {
  connect: connect,
  disconnect: disconnect
}
