const express = require('express');
const L = require('../utils/L');
const config = require('config');
const endpointsSource = require('../config/endpoints');
const MessageFactory = require('../entities/messageFactory');
const RocketChatWrapper = require('../wrappers/rocketChatWrapper');
const CronValidatorWrapper = require('../wrappers/cronValidatorWrapper');
const ExpressConfigurator = require('./expressConfigurator');

const sources = config.util.getConfigSources();
L.info('Using configs:');
L.info(JSON.stringify(sources));

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = config.get('hazel.ignoreSSLErrors') ? 0 : 1;

/**
 * MESSAGE FACTORY INITIALIZATION
 */
const rocketChatAlias = config.get('rocketchat.alias');
const rocketChatChannel = config.get('rocketchat.channel');
const factory = new MessageFactory(rocketChatChannel, rocketChatAlias);

/**
 * ROCKET CHAT CLIENT INITIALIZATION
 */
const rocketChatPort = config.get('rocketchat.port');
const rocketChatDomain = config.get('rocketchat.domain');
const rocketChatUserId = config.get('rocketchat.userId');
const rocketChatProtocol = config.get('rocketchat.protocol');
const rocketChatAuthToken = config.get('rocketchat.authToken');
const rocketChat = new RocketChatWrapper(rocketChatProtocol, rocketChatDomain, rocketChatPort, rocketChatUserId, rocketChatAuthToken);

/**
 * CONFIGURE AND START CRON
 */
const cronPattern = config.get('hazel.cronPattern');
const endpointsToValidate = endpointsSource.get();
new CronValidatorWrapper(cronPattern, endpointsToValidate, rocketChat, factory).start();

/**
 * CALLBACK WHEN MAINTENANCE MODE CHANGES
 */

function maintenanceModeChanged(newMode) {
    L.silly("Maintenance mode changed to " + newMode);
    rocketChat.sendMessage(factory.buildMaintenanceModeChanged(newMode));
}

/**
 * CONFIGURE EXPRESS APP AND MIDDLEWARE
 */
const app = express();
const port = config.get('server.port');
new ExpressConfigurator(app, port, maintenanceModeChanged).configure();
