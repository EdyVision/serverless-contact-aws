//@flow
'use strict';

const axios = require('axios');
const crypto = require('crypto');

exports.time_correction = (event_date, event_timezone_offset) => {
    let d = new Date(event_date);
    let timeCorrection = d.getTimezoneOffset() - event_timezone_offset;
    d.setMinutes(d.getMinutes() + timeCorrection);
    return (
        `${d.getFullYear()}-${d.getMonth()}-${d.getDate()} ` +
        `${d.getHours()}:${d.getMinutes()}`
    );
};

exports.submitRequest = async function(url, headers) {
    try {
        let result = {
            statusCode: 500,
            data: {}
        };
        return axios.get(url, headers).then(response => {
            result.statusCode = response.status;
            result.data = response.data;
            return result;
        });
    } catch (error) {
        console.error(error);
    }
};

exports.submitRequestWithBody = async function(url, method, body) {
    try {
        let result = {
            statusCode: 500,
            data: {}
        };
        let request = { url: url, method: method, data: body };
        return axios(request).then(response => {
            console.log(response);
            result.statusCode = response.status;
            result.data = response.data;
            return result;
        });
    } catch (error) {
        console.error(error);
    }
};

/**
 * Generates a request signature
 *
 * @param {*} stringToSign string to sign
 * @param {*} secretKey secret key to sign with
 * @returns {*} hex string
 */
exports.sha256 = (stringToSign, secretKey) => {
    var hex = crypto.HmacSHA256(stringToSign, secretKey);
    return hex.toString(crypto.enc.Base64);
};

/**
 * @returns {*} an ISO8601 Formatted Timestamp
 */
exports.timestamp = () => {
    var date = new Date();
    var y = date.getUTCFullYear().toString();
    var m = (date.getUTCMonth() + 1).toString();
    var d = date.getUTCDate().toString();
    var h = date.getUTCHours().toString();
    var min = date.getUTCMinutes().toString();
    var s = date.getUTCSeconds().toString();

    if (m.length < 2) {
        m = '0' + m;
    }
    if (d.length < 2) {
        d = '0' + d;
    }
    if (h.length < 2) {
        h = '0' + h;
    }
    if (min.length < 2) {
        min = '0' + min;
    }
    if (s.length < 2) {
        s = '0' + s;
    }

    var formattedDate = y + '-' + m + '-' + d;
    var time = h + ':' + min + ':' + s;
    return formattedDate + 'T' + time + 'Z';
};
