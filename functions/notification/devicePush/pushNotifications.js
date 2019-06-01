'use strict';

const AWS = require('aws-sdk');

const pinpoint = new AWS.Pinpoint({
    apiVersion: 'latest'
});

/**
 * Submits device notification via AWS Pinpoint
 *
 * @param {*} userObj the user object
 * @param {*} messageObj the message object
 * @param {*} traceId trace id for notification
 * @returns {Promise} push notification promise
 */
exports.submitDevicePushNotification = (userObj, messageObj, traceId) => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            errors: {},
            results: {}
        };
        let params = {};

        // iOS can only support APNS and Android GCM
        if (messageObj.platform === 'iOS') {
            params = setupIosNotificationParameters(
                userObj,
                messageObj,
                traceId,
                messageObj.platform
            );
        } else {
            params = setupAndroidNotificationParameters(
                userObj,
                messageObj,
                traceId
            );
        }

        pinpoint.sendMessages(params, function(err, data) {
            if (err) {
                resp.errors = err;
                resolve({
                    statusCode: 500,
                    body: resp.errors
                });
            } else {
                resp.success = true;
                resp.results = data;
                resolve({
                    statusCode: 200,
                    body: resp.results
                });
            }
        });
    });
};

/**
 * Submits email notification via AWS Pinpoint
 *
 * @param {*} userObj the user object
 * @param {*} messageObj the message object
 * @param {*} traceId trace id for notification
 * @returns {Promise} email notification promise
 */
exports.submitEmailPushNotification = (userObj, messageObj, traceId) => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            errors: {},
            results: {}
        };
        let params = setupEmailNotificationParameters(
            userObj,
            messageObj,
            traceId
        );

        pinpoint.sendMessages(params, function(err, data) {
            if (err) {
                resp.errors = err;
                resolve({
                    statusCode: 500,
                    body: JSON.stringify(resp.errors)
                });
            } else {
                resp.success = true;
                resp.results = data;
                resolve({
                    statusCode: 200,
                    body: JSON.stringify(resp.results)
                });
            }
        });
    });
};

/**
 * Sets up Email Notification Parameters
 * @param {*} userObj the user object
 * @param {*} messageObj the message object
 * @param {*} traceId trace id for notification
 * @returns {*} parameters for email notification
 */
function setupEmailNotificationParameters(userObj, messageObj, traceId) {
    return {
        ApplicationId: process.env.PINPOINT_APP_ID,
        MessageRequest: {
            Addresses: {
                [userObj.cognitoInfo.email]: {
                    ChannelType: 'EMAIL'
                }
            },
            MessageConfiguration: {
                EmailMessage: {
                    Body: messageObj.body,
                    FeedbackForwardingAddress: process.env.NO_REPLY_EMAIL,
                    FromAddress: process.env.NO_REPLY_EMAIL,
                    // RawEmail: {
                    //     Data: new Buffer(messageObj.body) || messageObj.body /* Strings will be Base-64 encoded on your behalf */
                    // },
                    ReplyToAddresses: [process.env.NO_REPLY_EMAIL],
                    SimpleEmail: {
                        HtmlPart: {
                            Data: messageObj.body
                        },
                        Subject: {
                            Data: messageObj.title
                        },
                        TextPart: {
                            Data: messageObj.body
                        }
                    }
                }
            },
            TraceId: traceId
        }
    };
}

/**
 * Submits sms notification via AWS Pinpoint
 *
 * @param {*} userObj the user object
 * @param {*} messageObj the message object
 * @param {*} traceId trace id for notification
 * @returns {Promise} SMS notification promise
 */
exports.submitSMSPushNotification = (userObj, messageObj, traceId) => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            errors: {},
            results: {}
        };
        let params = setupSMSNotificationParameters(
            userObj,
            messageObj,
            traceId
        );

        pinpoint.sendMessages(params, function(err, data) {
            if (err) {
                resp.errors = err;
                resolve({
                    statusCode: 500,
                    body: JSON.stringify(resp.errors)
                });
            } else {
                resp.success = true;
                resp.results = data;
                resolve({
                    statusCode: 200,
                    body: JSON.stringify(resp.results)
                });
            }
        });
    });
};

/**
 * Sets up SMS Notification Parameters
 * @param {*} userObj the user object
 * @param {*} messageObj the message object
 * @param {*} traceId trace id for notification
 * @returns {*} parameters for SMS notification
 */
function setupSMSNotificationParameters(userObj, messageObj, traceId) {
    return {
        ApplicationId: process.env.PINPOINT_APP_ID,
        MessageRequest: {
            Addresses: {
                [userObj.cognitoInfo.email]: {
                    ChannelType: 'SMS'
                }
            },
            SMSMessage: {
                Body: 'string',
                Substitutions: {},
                SenderId: 'string',
                MessageType: 'TRANSACTIONAL',
                Keyword: 'string',
                OriginationNumber: 'string'
            },
            TraceId: traceId
        }
    };
}

/**
 * Sets up IOS Notification Parameters
 * @param {*} userObj the user object
 * @param {*} messageObj the message object
 * @param {*} traceId trace id for notification
 * @returns {*} IOS Notification Parameters
 */
function setupIosNotificationParameters(userObj, messageObj, traceId) {
    return {
        ApplicationId: process.env.PINPOINT_APP_ID,
        MessageRequest: {
            Addresses: {
                [userObj.token]: {
                    ChannelType: 'APNS'
                }
            },
            MessageConfiguration: {
                APNSMessage: {
                    Action: messageObj.action, // 'OPEN_APP' | 'DEEP_LINK' | 'URL'
                    Badge: 0, // this needs to come from the getUserNotificationCount function
                    Body: messageObj.body,
                    Category: messageObj.Category,
                    // Custom Attributes go here
                    Data: {
                        notificationCount: userObj.notificationCount.toString()
                    },
                    MediaUrl: messageObj.mediaUrl,
                    SilentPush: false,
                    Sound: 'default',
                    TimeToLive: 0,
                    Title: messageObj.title,
                    Url: messageObj.url
                }
            },
            TraceId: traceId
        }
    };
}

/**
 * Sets up Android Notification Parameters
 * @param {*} userObj the user object
 * @param {*} messageObj the message object
 * @param {*} traceId trace id for notification
 * @returns {*} Android Notification Parameters
 */
function setupAndroidNotificationParameters(userObj, messageObj, traceId) {
    return {
        ApplicationId: process.env.PINPOINT_APP_ID,
        MessageRequest: {
            Addresses: {
                [userObj.token]: {
                    ChannelType: 'GCM'
                }
            },
            MessageConfiguration: {
                DefaultMessage: {
                    Body: messageObj.body
                },
                DefaultPushNotificationMessage: {
                    Action: messageObj.action,
                    Body: messageObj.body,
                    // Custom Attributes go here
                    Data: {
                        notificationCount: userObj.notificationCount.toString()
                    },
                    SilentPush: false,
                    Title: messageObj.title,
                    Url: messageObj.url
                }
            },
            TraceId: traceId
        }
    };
}
