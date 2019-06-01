'use strict';

const emailNotification = require('./email/submitEmail');

// Has to be a registered email in SES, otherwise you will
// need to get out of sandbox mode
const email = process.env.INFO_EMAIL;

/**
 * Submits email from system
 *
 * @param {*} event Required: fromEmail, toEmail, subject, data
 * @returns {Promise} email submission results
 */
exports.submitEmail = event => {
    return new Promise(async resolve => {
        let query = JSON.parse(event.body);

        if (query.fromAddress && query.subject && query.message) {
            let params = {
                toAddresses: [email],
                fromAddress: query.fromAddress,
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
