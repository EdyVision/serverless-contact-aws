/* eslint-disable no-async-promise-executor */
'use strict';

const notifications = require('./functions/notification/notificationCtrl');

module.exports.submitEmail = async event => {
    return notifications.submitEmail(event);
};
