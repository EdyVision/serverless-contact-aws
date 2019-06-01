'use strict';

const NotificationModel = require('../../db/models/notificationModel');
const pushNotifications = require('./devicePush/pushNotifications');
const User = require('../users/userCtrl');
const common = require('../../utils/common.js');
const database = require('../../db/dbmanager');
const emailNotification = require('./email/submitEmail');

/**
 * Send User Remote Notification Endpoint
 *
 * Purpose: Given a notification token and message object this function
 * sends a notification from AWS Pinpoint to a specific users device.
 *
 * @param {Object} event Required Input:
 * cognitoUser
 * title (subject of notification)
 * body (content of notification)
 * type (device, email, both)
 *
 * Optional Input:
 * url (url of page they need to open)
 * mediaUrl
 * @returns {Promise} remote notification results
 */
exports.sendUserRemoteNotification = event => {
    return new Promise(async resolve => {
        if (event) {
            let notificationEvent = getParameterObject(event);
            let messageObj = {
                action:
                    notificationEvent.action !== undefined
                        ? notificationEvent.action
                        : '',
                body:
                    notificationEvent.body !== undefined
                        ? notificationEvent.body
                        : '',
                category:
                    notificationEvent.category !== undefined
                        ? notificationEvent.category
                        : '',
                mediaUrl:
                    notificationEvent.mediaUrl !== undefined
                        ? notificationEvent.mediaUrl
                        : '',
                platform:
                    notificationEvent.platform !== undefined
                        ? notificationEvent.platform
                        : '',
                title:
                    notificationEvent.title !== undefined
                        ? notificationEvent.title
                        : '',
                type:
                    notificationEvent.type !== undefined
                        ? notificationEvent.type
                        : '', // this will be needed to tell the client what category of action to take
                url:
                    notificationEvent.url !== undefined
                        ? notificationEvent.url
                        : '',
                notificationCategory:
                    notificationEvent.notificationCategory !== undefined
                        ? notificationEvent.notificationCategory
                        : '',
                replyTo: notificationEvent.replyToAddress
            };

            let userObj = {
                cognitoUser:
                    notificationEvent.cognitoUser !== undefined
                        ? notificationEvent.cognitoUser
                        : '',
                token:
                    notificationEvent.deviceToken !== undefined
                        ? notificationEvent.deviceToken
                        : '',
                cognitoInfo: {},
                notificationCount: 0
            };

            let promises = [];
            promises.push(
                User.getCognitoPoolUser({
                    cognitoUser: notificationEvent.cognitoUser
                })
            );

            // Add the following call to the promises list.

            // await User.getCognitoPoolUserDeviceList(notificationEvent.cognitoUser).then(response => {
            //     console.log(response);
            // }).catch(reason => {
            //     console.log(reason);
            //     resp.errors = reason;
            // });
            let notification = {};
            notification.notificationType = notificationEvent.type;
            notification.title = notificationEvent.title;
            notification.body = notificationEvent.body;
            notification.senderId = notificationEvent.senderId;
            notification.receiverId = notificationEvent.receiverId;
            notification.cognitoUser = notificationEvent.cognitoUser;
            notification.notificationCategory =
                notificationEvent.notificationCategory;

            let traceId = null;

            promises.push(this.saveUserNotification(notification));
            promises.push(
                this.getUserNotificationCount({
                    cognitoUser: notificationEvent.cognitoUser
                })
            );

            Promise.all(promises)
                .then(results => {
                    userObj.cognitoInfo = JSON.parse(results[0].body).results;
                    traceId = JSON.parse(results[1].body).notification._id;
                    userObj.notificationCount = JSON.parse(
                        results[2].body
                    ).count;

                    let dependentPromises = [];

                    if (notificationEvent.type == 'device') {
                        dependentPromises.push(
                            pushNotifications.submitDevicePushNotification(
                                userObj,
                                messageObj,
                                traceId
                            )
                        );
                    } else if (notificationEvent.type == 'email') {
                        dependentPromises.push(
                            pushNotifications.submitEmailPushNotification(
                                userObj,
                                messageObj,
                                traceId
                            )
                        );
                    } else if (notificationEvent.type == 'sms') {
                        dependentPromises.push(
                            pushNotifications.submitSMSPushNotification(
                                userObj,
                                messageObj,
                                traceId
                            )
                        );
                    } else if (
                        notificationEvent.type != 'device' &&
                        notificationEvent.type != 'email' &&
                        notificationEvent.type != 'system'
                    ) {
                        // Send Push Notification (needs to be fixed)
                        // dependentPromises.push(pushNotifications.submitDevicePushNotification(userObj, messageObj, traceId));

                        // Send Email
                        dependentPromises.push(
                            pushNotifications.submitEmailPushNotification(
                                userObj,
                                messageObj,
                                traceId
                            )
                        );

                        // Send SMS
                        // dependentPromises.push(pushNotifications.submitSMSPushNotification(userObj, messageObj, traceId));
                    }

                    Promise.all(dependentPromises)
                        .then(results => {
                            resolve({
                                statusCode: 200,
                                body: JSON.stringify(results),
                                headers: {
                                    'Access-Control-Allow-Origin': '*'
                                }
                            }).catch(reason => {
                                resolve({
                                    statusCode: 500,
                                    body: JSON.stringify(reason),
                                    headers: {
                                        'Access-Control-Allow-Origin': '*'
                                    }
                                });
                            });
                        })
                        .catch(reason => {
                            resolve({
                                statusCode: 400,
                                body: JSON.stringify({
                                    error: reason
                                })
                            });
                        });
                })
                .catch(reason => {
                    resolve({
                        statusCode: 400,
                        body: JSON.stringify({
                            error: reason
                        })
                    });
                });
        } else {
            resolve({
                statusCode: 500,
                body: JSON.stringify({
                    error: 'Notification parameters were null.'
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    });
};

/**
 * Submits email from system
 *
 * @param {*} event Required: fromEmail, toEmail, subject, data
 * @returns {Promise} email submission results
 */
exports.submitEmail = event => {
    return new Promise(async resolve => {
        let query = getParameterObject(event);
        if (query.toEmail && query.fromEmail && query.subject && query.data) {
            let params = {
                toAddresses: [query.toEmail],
                emailSubject: query.subject,
                emailData: query.data.split(','),
                isInfo: true
            };
            emailNotification
                .submitEmail(params)
                .then(response => {
                    resolve({
                        statusCode: 202,
                        body: JSON.stringify(response),
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                })
                .catch(reason => {
                    console.log('reason', reason);
                    resolve({
                        statusCode: 400,
                        body: JSON.stringify({ error: reason }),
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                });
        } else {
            resolve({
                statusCode: 400,
                body: JSON.stringify({
                    error:
                        'Email submission is missing parameters. toEmail, fromEmail, subject, and data are all required.'
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
    });
};

/**
 * Get User Notification Count Endpoint
 *
 * Purpose: Given a users cognitoUser this function returns the total
 * number of notificaitions in the users queue.
 *
 * @param {String} event Required: cognitoUser
 * @returns {Promise} user notification count
 */
exports.getUserNotificationCount = event => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            results: {},
            errors: {}
        };
        let input = getParameterObject(event);

        // Connect to the database
        await database
            .connectToDatabase()
            .then(() => {
                // Get all the notification whose ownerId matches the cognitoUser
                NotificationModel.collection
                    .find({
                        receiverId: input.cognitoUser
                    })
                    .count()
                    .then(count => {
                        resp.success = true;
                        resp.results = {
                            count: count
                        };
                        resolve({
                            statusCode: 200,
                            body: JSON.stringify(resp.results),
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    })
                    .catch(error => {
                        resp.error = error;
                        resolve({
                            statusCode: 500,
                            body: JSON.stringify(resp.error),
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    });
            })
            .catch(() => {
                resolve({
                    statusCode: 500,
                    body: JSON.stringify({
                        error: 'Error retrieving notification count!'
                    }),
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            });
    });
};

/**
 * Get User Notification Count Endpoint
 *
 * Required Input: cognitoUser - String
 *
 * Purpose: Given a users cognitoUser this function returns the total
 * number of notificaitions in the users queue.
 *
 * @param {String} event cognitoUser string
 * @returns {Promise} user notifications
 */
exports.getUserNotifications = event => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            results: {},
            errors: {}
        };
        let cognitoUser = getParameterObject(event);
        let paginationSize = 25;

        // Connect to the database
        await database
            .connectToDatabase()
            .then(() => {
                // Get all the notification whose ownerId matches the cognitoUser
                NotificationModel.find({
                    receiverId: cognitoUser.cognitoUser
                })
                    .then(notifications => {
                        let paginationPages =
                            notifications.length > paginationSize
                                ? Math.ceil(
                                      notifications.length / paginationSize
                                  )
                                : 1;
                        resp.success = true;
                        resp.results = {
                            notifications: notifications,
                            totalNotifications: notifications.length,
                            totalPages: paginationPages,
                            paginationSize: paginationSize
                        };
                        resolve({
                            statusCode: 200,
                            body: JSON.stringify(resp.results),
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    })
                    .catch(error => {
                        resp.error = error;
                        resolve({
                            statusCode: 500,
                            body: JSON.stringify(resp.error),
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    });
            })
            .catch(error => {
                console.log(error);
                resolve({
                    statusCode: 500,
                    body: JSON.stringify({
                        error: 'Error retrieving notifications for user!'
                    }),
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            });
    });
};

/**
 * Save User Notification Endpoint
 *
 * Purpose: Given a users cognitoUser this function saves a notification object
 * to the specified users notification queue.
 *
 * @param {Object} notificationObj Required Input: Cognito Id - String
 *                 Notification Object - NotificationModel
 * @returns {Promise} user saved notification results
 */
exports.saveUserNotification = notificationObj => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            results: {},
            errors: {}
        };

        // Connect to the database
        await database
            .connectToDatabase()
            .then(() => {
                // Add notication object and save
                let notification = new NotificationModel();
                notification.notificationType = notificationObj.type;
                notification.title = notificationObj.title;
                notification.body = notificationObj.body;
                notification.senderId = notificationObj.senderId;
                notification.receiverId = notificationObj.receiverId;
                notification.cognitoUser = notificationObj.cognitoUser;

                notification
                    .save()
                    .then(success => {
                        resp.results = {
                            notification: success,
                            message: 'Notification successfully saved.'
                        };
                        resolve({
                            statusCode: 201,
                            body: JSON.stringify(resp.results),
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    })
                    .catch(error => {
                        console.log(error);
                        resp.errors = 'Error saving notification!';
                        resolve({
                            statusCode: 500,
                            body: JSON.stringify(resp.errors),
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    });
            })
            .catch(() => {
                resolve({
                    statusCode: 500,
                    body: 'Error saving notification!',
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            });
    });
};

/**
 * Remove User Notification Endpoint
 *
 * Purpose: Given a users cognitoUser this function removes a single user notification
 * from the given users notification queue.
 *
 * @param {*} event Required Input: cognitoUser - String
 *                 notificationId - String
 * @returns {Promise} removed user notification
 */
exports.removeUserNotification = event => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            results: {},
            errors: {}
        };
        let params = getParameterObject(event);
        // Connect to the database
        await database.connectToDatabase().then(() => {
            NotificationModel.deleteOne({
                _id: params.notificationId,
                cognitoUser: params.cognitoUser
            })
                .then(result => {
                    resp.results = {
                        result: result,
                        message: 'Notification deleted successfully.'
                    };
                    resolve({
                        statusCode: 202,
                        body: JSON.stringify(resp.results),
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                })
                .catch(reason => {
                    console.log(reason);
                    resp.errors = 'Error deleting notification!';
                    resolve({
                        statusCode: 500,
                        body: JSON.stringify({
                            error: resp.errors
                        }),
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        }
                    });
                });
        });
    }).catch(error => {
        console.log(error);
        // eslint-disable-next-line no-undef
        resolve({
            statusCode: 500,
            body: JSON.stringify({
                error: 'Error deleting notification!'
            }),
            headers: {
                'Access-Control-Allow-Origin': '*'
            }
        });
    });
};

/**
 * Remove All User Notifications Endpoint
 *
 * Purpose: Given a users cognitoUser this function removes all the notifications
 * from the given users notification queue.
 *
 * @param {*} event Required Input: cognitoUser - String
 * @returns {Promise} results of all removed notifications
 */
exports.removeAllUserNotifications = event => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            results: {},
            errors: {}
        };

        let params = getParameterObject(event);
        // Connect to the database
        await database
            .connectToDatabase()
            .then(() => {
                NotificationModel.deleteMany({
                    cognitoUser: params.cognitoUser
                })
                    .then(result => {
                        resp.results = {
                            result: result,
                            message: 'Notifications deleted successfully.'
                        };
                        resolve({
                            statusCode: 202,
                            body: JSON.stringify(resp.results),
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    })
                    .catch(reason => {
                        console.log(reason);
                        resp.errors = "Error deleting user's notifications!";
                        resolve({
                            statusCode: 500,
                            body: JSON.stringify(resp.errors),
                            headers: {
                                'Access-Control-Allow-Origin': '*'
                            }
                        });
                    });
            })
            .catch(error => {
                console.log(error);
                resolve({
                    statusCode: 500,
                    body: 'Error saving notification!',
                    headers: {
                        'Access-Control-Allow-Origin': '*'
                    }
                });
            });
    });
};

/**
 * Checks to see where in the event the client placed the query
 * parameters.
 *
 * NOTE: Perhaps this can go in common
 *
 * @param {*} query original event input
 * @returns {*} query parameter object
 */
function getParameterObject(query) {
    if (query) {
        if (
            !common.isEmpty(query.cognitoUser) ||
            !common.isEmpty(query.notificationId) ||
            !common.isEmpty(query.type) ||
            !common.isEmpty(query.toEmail)
        ) {
            return query;
        } else if (
            query.headers &&
            (!common.isEmpty(query.headers.cognitoUser) ||
                !common.isEmpty(query.headers.type) ||
                !common.isEmpty(query.headers.toEmail))
        ) {
            return query.headers;
        } else if (
            query.queryStringParameters &&
            (!common.isEmpty(query.queryStringParameters.cognitoUser) ||
                !common.isEmpty(query.queryStringParameters.type) ||
                !common.isEmpty(query.queryStringParameters.toEmail))
        ) {
            return query.queryStringParameters;
        }
    } else {
        return null;
    }
}
