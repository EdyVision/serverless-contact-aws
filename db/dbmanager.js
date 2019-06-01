const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected;

let DB_URL =
    process.env.ENV_TYPE == 'production'
        ? process.env.PROD_DB_URL
        : process.env.DEV_DB_URL;

exports.connectToDatabase = () => {
    if (isConnected) {
        return Promise.resolve();
    }

    return mongoose.connect(DB_URL).then(db => {
        isConnected = db.connections[0].readyState;
    });
};
