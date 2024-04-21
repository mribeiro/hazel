const L = require('../utils/L');
const CronJob = require('cron').CronJob;
const EndpointValidatorOrchestrator = require('../lib/endpointValidatorOrchestrator').EndpointValidatorOrchestrator;
const Cache = require('../utils/Cache');

class CronValidatorWrapper {
    cronPattern;
    endpointsToValidate;
    messageFactory;
    rocketChatClient;
    job;

    constructor(cronPattern, endpointsToValidate, rocketChatClient, messageFactory) {
        this.messageFactory = messageFactory;
        this.rocketChatClient = rocketChatClient;
        this.endpointsToValidate = endpointsToValidate;
        this.cronPattern = cronPattern;
    }

    start() {
        const endpointsToValidate = this.endpointsToValidate;

        const instance = this;

        this.job = new CronJob(this.cronPattern, function () {
            if (!Cache.maintenanceMode) {
                L.debug('Running cron...');
                let orchestrator = new EndpointValidatorOrchestrator(endpointsToValidate, instance.cronCallback.bind(instance));
                orchestrator.start();
            } else {
                L.info('Maintenance mode is on. Skipping check.');
            }
        }, null, true);

        this.job.start();
        this.rocketChatClient.sendMessage(this.messageFactory.buildHazelRebootedMessage(this.job.nextDate()));
    }

    cronCallback(results) {
        L.debug(`Cron finished and got ${results.length} results.`);
        Cache.results = results;
        Cache.lastCheck = new Date();
        Cache.nextCheck = this.job.nextDate();
        Cache.initialized = true;

        let downsReport = Array();
        let upsReport = Array();
        let nrDown = 0;

        if (Cache.summary === undefined) {
            Cache.summary = {};
            this.rocketChatClient.sendMessage(this.messageFactory.buildHazelReadyMessage());
            results.forEach(r => {
                Cache.summary[r.endpoint.friendlyName] = r.isUp;

                if (r.isUp === false) {
                    nrDown++;
                    downsReport.push(r);
                    L.silly(`Environment ${r.endpoint.friendlyName} is down. Nr of down is now ${nrDown}`);
                }

            });
            L.debug('Saved cache for the first time');

        } else {

            results.forEach(r => {

                if (r.isUp === false) {
                    nrDown+=1;
                    L.silly(`Environment ${r.endpoint.friendlyName} is down. Nr of down is now ${nrDown}`);
                }

                let previousStatus = Cache.summary[r.endpoint.friendlyName];

                if (previousStatus === r.isUp) {
                    //all good, nothing to there.
                    L.debug(`Status didn't change for ${r.endpoint.friendlyName}`);

                } else {
                    L.debug(`Status changed for ${r.endpoint.friendlyName}`);
                    Cache.summary[r.endpoint.friendlyName] = r.isUp;

                    if (previousStatus) {
                        L.info(`${r.endpoint.friendlyName} was up and now is down`);
                        downsReport.push(r);
                    } else {
                        L.info(`${r.endpoint.friendlyName} It was down and now is up`);
                        upsReport.push(r);
                    }
                }
            });
        }

        if (downsReport.length > 0) {
            this.rocketChatClient.sendMessage(this.messageFactory.buildNewEndpointsDownMessage(downsReport, nrDown));
        }

        if (upsReport.length > 0) {
            this.rocketChatClient.sendMessage(this.messageFactory.buildNewEndpointsUpMessage(upsReport, nrDown));
        }

    }

}

module.exports = CronValidatorWrapper;
