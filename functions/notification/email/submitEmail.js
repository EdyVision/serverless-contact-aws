'use strict';

const AWS = require('aws-sdk');

const ses = new AWS.SES();

let noReplyEmail = process.env.NO_REPLY_EMAIL;
let infoEmail = process.env.INFO_EMAIL;

/**
 * Submits Email
 * @param {*} emailParams Required Parameters in Query
 * - toAddresses: Addressee Array
 * - emailData: EmailData Array
 * - emailSubject: Respective Email Subject
 * - isInfo: true or false (required)
 * @returns {Promise} email submission results
 */
exports.submitEmail = emailParams => {
    return new Promise(async resolve => {
        let resp = {
            success: false,
            results: {},
            errors: {}
        };

        if (emailParams) {
            let toAddresses = emailParams.toAddresses;
            let emailData = emailParams.emailData;
            let subject = emailParams.emailSubject;
            let emailType = emailParams.isInfo ? infoEmail : noReplyEmail;
            let emailParameters = generateEmailParams({
                emails: toAddresses,
                content: emailData.join('\r\n'),
                subject: subject,
                emailType: emailType
            });
            await ses
                .sendEmail(emailParameters)
                .promise()
                .then(response => {
                    resolve({
                        statusCode: 201,
                        body: JSON.stringify(response),
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': 'x-requested-with',
                            'Access-Control-Allow-Credentials': true
                        }
                    });
                })
                .catch(reason => {
                    console.log(reason);
                    resolve({
                        statusCode: 500,
                        body: reason
                    });
                });
        } else {
            resp.errors = 'Parameters cannot be null!';
            resolve({
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'x-requested-with',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify(resp.errors)
            });
        }
    });
};

function generateEmailParams(body) {
    const { emails, content, subject, emailType } = body;

    if (!(emails && content && subject && emailType)) {
        throw new Error(
            "Missing parameters! Make sure to add parameters 'email', 'content', 'subject','emailType'."
        );
    }

    return {
        Source: emailType,
        Destination: {
            ToAddresses: emails
        },
        ReplyToAddresses: [emailType],
        Message: {
            Body: {
                Text: {
                    Charset: 'UTF-8',
                    Data: `${content}`
                }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: subject
            }
        }
    };
}
