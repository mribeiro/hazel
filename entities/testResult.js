const Endpoint = require('./endpoint').Endpoint;

class TestResult {
    endpoint;
    isUp;
    httpStatus;
    responseTime;

    /**
     *
     * @param {Endpoint} endpoint
     */
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

}

module.exports.TestResult = TestResult;
