'use strict';

const notifications = require('./functions/notification/notificationCtrl');

module.exports.submitEmail = async event => {
    return notifications.submitEmail(event);
};
