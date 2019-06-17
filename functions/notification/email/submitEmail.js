'use strict';

const AWS = require('aws-sdk');

const ses = new AWS.SES();

let infoEmail = process.env.INFO_EMAIL;

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers':
        'Origin, X-Requested-With, Content-Type, Accept, X-Api-Key, Authorization',
    'Access-Control-Allow-Credentials': 'true'
};

/**
 * Submits Email with AWS SES
 * @param {*} emailParams Required Parameters in Query
 * - toAddresses: Addressee Array
 * - fromAddress: Person Sending Email
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
            let emailType = infoEmail;
            let replyTo = emailParams.fromAddress;

            let emailParameters = generateEmailParams({
                emails: toAddresses,
                replyTo: replyTo,
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
                        headers: headers
                    });
                })
                .catch(reason => {
                    console.log(reason);
                    resolve({
                        statusCode: 500,
                        body: JSON.stringify(reason)
                    });
                });
        } else {
            resp.errors = 'Parameters cannot be null!';
            resolve({
                statusCode: 400,
                headers: headers,
                body: JSON.stringify(resp.errors)
            });
        }
    });
};

function generateEmailParams(body) {
    const { emails, content, subject, emailType, replyTo } = body;
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
        ReplyToAddresses: [replyTo],
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
