const RocketChatApi = require('rocketchat-api');
const L = require('../utils/L');

class RocketChatWrapper {

    rocketChatClient;

    constructor(httpProcotol, domain, port, userId, userToken) {
        this.rocketChatClient = new RocketChatApi(httpProcotol, domain, port);
        this.rocketChatClient.setUserId(userId);
        this.rocketChatClient.setAuthToken(userToken);
    }

    sendMessage(message) {
        this.rocketChatClient.chat.postMessage(message, function (c) {
            L.silly('Sending rocket message');
            L.silly(message);
            if (c === null) {
                L.debug('Rocket Chat message sent with success');
            } else {
                L.error("Rocket Chat message failed to send: " + c);
            }
        });
    }
}

module.exports = RocketChatWrapper;
