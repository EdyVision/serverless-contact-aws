//@flow
'use strict';

const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate');
const Schema = mongoose.Schema;

var jsonNotification = {
    _id: {
        type: Schema.Types.ObjectId,
        auto: true
    },
    notificationType: String,
    notificationCategory: String,
    title: String,
    receiverId: {
        type: String
    },
    cognitoUser: {
        type: String
    },
    senderId: {
        type: String
    },
    body: {
        type: Schema.Types.Mixed
    },
    dateCreated: {
        type: Date,
        default: Date.now,
        auto: true
    }
};

var notificationSchema = new Schema(jsonNotification);

notificationSchema.plugin(mongoosePaginate);

function modelAlreadyDeclared() {
    try {
        mongoose.model('Notifications'); // it throws an error if the model is still not defined
        return true;
    } catch (e) {
        return false;
    }
}

module.exports =
    modelAlreadyDeclared() === true
        ? mongoose.model('Notifications')
        : mongoose.model('Notifications', notificationSchema);
