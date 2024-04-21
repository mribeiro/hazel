const request = require('request');
const Endpoint = require('../entities/endpoint').Endpoint;
const TestResult = require('../entities/testResult').TestResult;
const L = require('../utils/L');
const util = require('util');

/**
 * Validates a single endpoint and returns on a callback once done.
 */
class EndpointValidator {
    /**
     * @type {Endpoint}
     */
    endpoint;

    /**
     * @callback ValidatorCallback
     * @param {TestResult} testResult
     */
    callback;

    /**
     * @constructor
     * @param {Endpoint} endpoint
     * @param {ValidatorCallback} callback
     *
     */
    constructor(endpoint, callback) {
        this.endpoint = endpoint;
        this.callback = callback;
    }

    /**
     * Validates a single endpoint, passed on the constructor.
     * The result is sent to the callback.
     */
    validate() {

        let headers = {
            'hazel-check': new Date().toISOString()
        };

        if (this.endpoint.headers) {
            this.endpoint.headers.forEach(header => headers[header.name] = header.value);
        }

        const options = {
            url: this.endpoint.endpoint,
            headers: headers,
            timeout: this.endpoint.timeout || 1000,
            strictSSL: false
        };

        let start = Date.now();

        L.debug(`Testing ${JSON.stringify(this.endpoint.endpoint)} with options ${JSON.stringify(options)} ...`);

        request(options, (error, response, body) => {

            if (error) {
                L.warn(`Error received for endpoint: `);
                L.warn(util.inspect(this.endpoint));
                L.warn(util.inspect(error));
            }

            let time = Date.now() - start;

            let testResult = new TestResult(this.endpoint);
            testResult.isUp = response !== undefined && response.statusCode === this.endpoint.expectedStatus;
            testResult.httpStatus = response ? response.statusCode : 0;
            testResult.responseTime = time;

            L.debug(`Result received:`);
            L.debug(util.inspect(testResult));

            if (this.callback) {
                this.callback(testResult);
            } else {
                L.debug('No callback provided when endpoint is validated.');
            }
        });
    }
}

module.exports.EndpointValidator = EndpointValidator;
