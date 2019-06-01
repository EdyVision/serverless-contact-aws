'use strict';

const common = require('../../utils/common.js');
const emailNotification = require('./email/submitEmail');

/**
 * Submits email from system
 *
 * @param {*} event Required: fromEmail, toEmail, subject, data
 * @returns {Promise} email submission results
 */
exports.submitEmail = event => {
    return new Promise(async resolve => {
        let query = JSON.parse(event.body);
        let emailAddress = "edy.vision18@gmail.com";

        if (query.fromAddress && query.subject && query.message) {
            let params = {
                toAddresses: [emailAddress],
                fromAddress: emailAddress,
                emailSubject: query.subject,
                emailData: query.message.split(',')
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
                        'Email submission is missing parameters. fromAddress, subject, and message are all required.'
                }),
                headers: {
                    'Access-Control-Allow-Origin': '*'
                }
            });
        }
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
