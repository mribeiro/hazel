#!/usr/bin/env node

const program = require('commander');
const endpointsSource = require('../config/endpoints');
const EndpointValidatorOrchestrator = require('../lib/endpointValidatorOrchestrator').EndpointValidatorOrchestrator;
const TestResult = require('../entities/testResult').TestResult;
const {table} = require('table');
const Spinner = require('cli-spinner').Spinner;
const fs = require('fs');

program
    .command('testAll')
    .description('Tests all endpoints')
    .action(() => {

        let spinner = new Spinner('I\'ll be with you in sec... %s');
        spinner.setSpinnerString('⠋⠙⠹⠸⠼⠴⠦⠧⠇⠏');
        spinner.start();

        let endpoints = endpointsSource.get();
        /**
         *
         * @param {Array<TestResult>} testResults
         */
        function finalCallback(testResults) {
            let map = testResults
                .sort((a, b) => a.isUp ? 1 : -1)
                .map(result => {

                    let headerString = "";
                    if (result.endpoint.headers) {
                        let nrOfHeaders = result.endpoint.headers.length;
                        headerString = result.endpoint.headers.reduce((accumulator, header, index) => {
                            accumulator = `${accumulator}${header.name}: ${header.value}`;
                            if (index + 1 < nrOfHeaders) {
                                accumulator = `${accumulator}\n`;
                            }
                            return accumulator
                        }, "");
                    }

                    return [result.endpoint.friendlyName, result.endpoint.endpoint, headerString, result.endpoint.expectedStatus, result.httpStatus, result.responseTime, result.isUp]
                });

            let header = [['Friendly name', 'Endpoint', 'Headers', 'Expected HTTP status', 'HTTP Status', 'Response time', 'Up?']];
            spinner.stop(true);
            console.log(table(header.concat(map)));
        }

        let orchestrator = new EndpointValidatorOrchestrator(endpoints, finalCallback);
        orchestrator.start();
    });


program.command('fetch')
    .action(() => {
        fs.readFile('hazel.txt', {encoding: 'utf-8'}, function (err, data) {
            console.log(data);
        });
    });

program.parse(process.argv);
