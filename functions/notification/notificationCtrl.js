'use strict';

const emailNotification = require('./email/submitEmail');

// Has to be a registered email in SES, otherwise you will
// need to get out of sandbox mode
const email = process.env.INFO_EMAIL;

// Headers needed for Locked Down APIs
const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept, X-Api-Key, Authorization',
    'Access-Control-Allow-Credentials': 'true'
};

//#region Function messages
const successMsg = 'Thank you for contacting us! Your message has been sent.';

const invalidEmailMsg = 'Email is invalid.';

const invalidParamsMsg =
    'Email submission is missing parameters. fromAddress, subject, and message are all required.';
//#endregion Function messages

//#region Validation Functions
function validateEmail(email) {
    if (!validateFormValue(email, true, 255)) return false;
    var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    if (!emailRegex.test(email)) return false;
    return true;
}

function validateFormValue(value, required, maxLength) {
    required = typeof required !== 'undefined' ? required : true;
    maxLength = typeof maxLength !== 'undefined' ? maxLength : 255;
    if (required && !value) return false;
    if (value.length > maxLength) return false;
    return true;
}
//#endregion Validation Functions

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
            if (!validateEmail(email)) {
                resolve({
                    statusCode: 400,
                    body: JSON.stringify({ error: invalidEmailMsg }),
                    headers: headers
                });
            }

            let params = {
                toAddresses: [email],
                fromAddress: query.fromAddress,
                emailSubject: query.subject,
                emailData: query.message.split(',')
            };

            emailNotification
                .submitEmail(params)
                .then(() => {
                    resolve({
                        statusCode: 202,
                        body: JSON.stringify({ message: successMsg }),
                        headers: headers
                    });
                })
                .catch(reason => {
                    console.log('reason', reason);
                    resolve({
                        statusCode: 400,
                        body: JSON.stringify({ error: reason }),
                        headers: headers
                    });
                });
        } else {
            resolve({
                statusCode: 400,
                body: JSON.stringify({
                    error: invalidParamsMsg
                }),
                headers: headers
            });
        }
    });
};
