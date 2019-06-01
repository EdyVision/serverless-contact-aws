//@flow
'use strict';

const axios = require('axios');
const crypto = require('crypto');
const parseString = require('xml2js').parseString;

const _this = this;

exports.static_values = {
    PAGINATE_LIMIT: 50,
    RC_ALREADY_EXISTS: 'ALREAY_EXISTS'
};

/**
 * function: paginate_results
 * desc: Paginate results
 * @param {*} results - colleciton to sort
 *  - optional properties of the collection is the {sortField} if present it can be used to sort the results.
 * @param {*} sortField - (Optional) Field to perform sort on
 * @param {*} pageNumber - (Optional) If specified the pagination will use this return results for this page.
 *
 * @returns {*} results{} - results object including pagination information.
 */
exports.paginate_results = (results, sortField, pageNumber) => {
    let resultsCount = _this.isEmpty(results) === true ? 0 : results.length;
    if (resultsCount > 0) {
        // - sort members decending if sorter property defined
        if (_this.isEmpty(sortField) === false) {
            results.sort((m1, m2) => {
                if (m1[sortField] < m2[sortField]) {
                    return 1;
                }
                if (m1[sortField] > m2[sortField]) {
                    return -1;
                }
                return 0;
            });
        }

        // let stringifiedResults = {};
        // stringifiedResults = JSON.parse(JSON.stringify(results));

        let page =
            _this.isEmpty(pageNumber) === true ? 0 : parseInt(pageNumber);
        let pages = Math.ceil(
            parseInt(resultsCount) / process.env.PAGINATE_LIMIT
        );
        if (page > pages) {
            page = pages;
        }
        let startIndex =
            page * process.env.PAGINATE_LIMIT === 0
                ? 0
                : page * process.env.PAGINATE_LIMIT;
        let endIndex = startIndex + process.env.PAGINATE_LIMIT;
        let paginatedResults = {};
        paginatedResults['results'] = [];
        paginatedResults['results'] = results.slice(startIndex, endIndex);
        paginatedResults['limit'] = process.env.PAGINATE_LIMIT;
        paginatedResults['page'] = page;
        paginatedResults['pages'] = pages;
        paginatedResults['total'] = resultsCount;
        return paginatedResults;
    } else {
        return {};
    }
};

exports.isEmpty = function(obj) {
    // null and undefined are "empty"
    if (obj == null) return true;

    // Checks for boolean values
    if (obj === false || obj === true) return false;

    // Assume if it has a length property with a non-zero value
    // that that property is correct.
    if (obj.length > 0) return false;
    if (obj.length === 0) return true;

    // If it isn't an object at this point
    // it is empty, but it can't be anything *but* empty
    // Is it empty?  Depends on your application.
    if (typeof obj !== 'object') return true;

    // Otherwise, does it have any properties of its own?
    // Note that this doesn't handle
    // toString and valueOf enumeration bugs in IE < 9
    for (var key in obj) {
        if (hasOwnProperty.call(obj, key)) return false;
    }

    return true;
};

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

exports.submitXmlRequest = async function(url) {
    try {
        let result = {
            statusCode: 500,
            data: {}
        };
        return axios.get(url).then(response => {
            result.statusCode = response.status;
            let parsedBody = {};
            parseString(response.data, function(err, result) {
                if (err) {
                    parsedBody = err;
                } else {
                    parsedBody = result;
                }
            });
            result.data = parsedBody;
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
