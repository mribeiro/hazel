const Endpoint = require('../entities/endpoint').Endpoint;
const TestResult = require('../entities/testResult').TestResult;
const EndpointValidator = require('./endpointValidator').EndpointValidator;
const L = require('../utils/L');
const util = require('util');

/**
 * This class facilitates the validation of several endpoints.
 * They are tested sequentially, not in parallel.
 */
class EndpointValidatorOrchestrator {
    /**
     * @callback OrchestratorCallback
     * @param {Array<TestResult>} results
     * @param {*} [data]
     */
    finalCallback;
    /**
     * @type {*}
     */
    originalData;
    /**
     * @type {Array<Endpoint>}
     */
    endpoints;
    /**
     * @type {Array<TestResult>}
     */
    results;

    /**
     *
     * @param {OrchestratorCallback} finalCallback
     * @param {*} [originalData]
     * @param {Array<Endpoint>} endpoints
     */
    constructor(endpoints, finalCallback, originalData = undefined) {
        this.finalCallback = finalCallback;
        this.originalData = originalData;
        this.endpoints = Array.from(endpoints);
        this.results = Array();
    }

    /**
     * Starts the validation and, when done, invokes the callback.
     */
    start() {
        L.debug(`Orchestrating ${this.endpoints.length} tests`);
        if (this.endpoints.length > 0) {
            let endpointToValidate = this.endpoints.pop();
            L.debug(`Will test ${util.inspect(endpointToValidate)}`);
            let ev = new EndpointValidator(endpointToValidate, this.onEndpointValidated.bind(this));
            ev.validate();

        } else {
            L.debug(`All tests finished.`);
            L.silly(`Results ${util.inspect(this.results)}`);
            this.finalCallback(this.results, this.originalData);
        }
    }

    /**
     * Used as callback for every endpoint validated.
     * @param {TestResult} result
     */
    onEndpointValidated(result) {
        L.debug(`Endpoint validated: ${util.inspect(result)}`);
        this.results.push(result);
        this.start();
    }
}

module.exports.EndpointValidatorOrchestrator = EndpointValidatorOrchestrator;
