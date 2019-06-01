const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
let isConnected; // might be able to remove

let DB_URL =
    process.env.ENV_TYPE == 'production'
        ? process.env.PROD_DB_URL
        : process.env.DEV_DB_URL;

exports.connectToDatabase = () => {
    // Can probably remove I dont think it will ever be connected since we have no server
    if (isConnected) {
        return Promise.resolve();
    }

    return mongoose.connect(DB_URL).then(db => {
        // might be able to remove
        isConnected = db.connections[0].readyState;
    });
};
