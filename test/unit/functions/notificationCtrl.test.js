/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
const expect = require('chai').expect;
const sinon = require('sinon');
const mongoose = require('mongoose');

let notificationCtrl = require('../../../functions/notification/notificationCtrl');

describe('notificationCtrl getUserNotifications', function notificationCtrlTest() {

    before(function(done) {
        // mongoose.connect(process.env.DEV_DB_URL, function(error) {
        //     if (error) {
        //         console.error('Error while connecting:\n%\n', error);
        //     }
        //     done();
        // });
    });

    context('input missing', function() {
        it('failure', async function() {
            await notificationCtrl
                .getUserNotifications(null)
                .then(response => {
                    expect(response.statusCode).to.eq(400);
                    // expect(response.body).to.contain('');
                })
                .catch(reason => {
                    console.log(reason);
                });
        });
    });

    context('input ok', function() {
        let event = {
            headers: {
                cognitoUser: 'RavenCode'
            }
        };

        it('success', async function() {
            await notificationCtrl
                .getUserNotifications(event)
                .then(response => {
                    expect(response.statusCode).to.eq(200);
                    expect(response.body.data).to.not.eq(null);
                })
                .catch(reason => {
                    console.log(reason);
                });
        });
    });
});
