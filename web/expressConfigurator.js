const Cache = require('../utils/Cache');
const L = require('../utils/L');
const express = require('express');
const bodyParser = require('body-parser');

class ExpressConfigurator {
    app;
    port;
    maintenanceModeChangedCallback;

    constructor(app, port, maintenanceModeChangedCallback) {
        this.port = port;
        this.app = app;
        this.maintenanceModeChangedCallback = maintenanceModeChangedCallback;
    }

    configure() {
        this.app.use(express.static('public'));
        this.app.use(bodyParser.json());
        this.app.locals.moment = require('moment');
        this.app.set('view engine', 'pug');
        this.app.set('views', './views');
        // VALIDATES IF THE CRON RAN AT LEAST THE FIRST TIME

        let hazelNotReadyMW = function (req, res, next) {
            if (Cache.initialized === true) {
                next();
            } else {
                res.sendFile(__dirname + '/static/wait.html');
            }
        };
        hazelNotReadyMW.unless = require('express-unless');
        this.app.use(hazelNotReadyMW.unless({path: ['/maintenanceMode']})); // IGNORE maintenanceMode PATHS

        /**
         * EXPRESS ENDPOINTS
         */
        this.app.get('/', (req, res) => {
            res.send(Cache.results);
        });

        this.app.get('/dashboard', (req, res) => {
            let nrOfDown = Cache.results.reduce((accumulator, currentValue) => !currentValue.isUp ? ++accumulator : accumulator, 0);
            res.render('endpoints_results', {results: Cache.results, nrOfDown: nrOfDown, lastCheck: Cache.lastCheck, nextCheck: Cache.nextCheck, title: "Hazel", maintenanceMode: Cache.maintenanceMode});
        });

        this.app.get('/summary', (req, res) => {
            let nrEndpointsDown = Cache.results.filter((r) => !r.isUp).length;
            let summary = {};
            summary['downCount'] = nrEndpointsDown;
            summary['anyDown'] = nrEndpointsDown > 0;

            res.send(summary);
        });


        this.app.get('/maintenanceMode', (req, res) => {
            let maintenanceMode = { maintenanceMode: Cache.maintenanceMode };
            res.send(maintenanceMode);
        });

        this.app.put('/maintenanceMode', (req, res) => {
            let newMode = req.body.maintenanceMode;
            if (typeof newMode === "boolean") {
                Cache.maintenanceMode = newMode;
                if (this.maintenanceModeChangedCallback) {
                    this.maintenanceModeChangedCallback(newMode);
                } else {
                    L.silly("No maintenance mode changed callback configured.");
                }
                // send a 200
                res.status(200).send({ maintenanceMode: Cache.maintenanceMode });

            } else {
                // send a 400
                res.status(400).send({ error: "maintenanceMode must be a boolean" });
            }
        });

        this.app.listen(this.port, () => L.info(`Hazel looking at port ${this.port}!`));
    }

}

module.exports = ExpressConfigurator;
