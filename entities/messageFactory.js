const TestResult = require('../entities/testResult').TestResult;
const moment = require('moment');

class MessageFactory {
    channel;
    alias;

    constructor(channel, alias) {
        this.alias = alias;
        this.channel = channel;
    }

    buildHazelRebootedMessage(nextRun) {
        return new SimpleMessage(this.alias, this.channel, `Hazel is restarting... will do the first check ${moment(nextRun).fromNow()}`);
    }

    buildHazelReadyMessage() {
        return new SimpleMessage(this.alias, this.channel, "Hazel is ready!");
    }

    buildMaintenanceModeChanged(newStatus) {
        let message;
        if (newStatus) {
            message = "Maintenance mode ON. No check will be made until this is switched off.";
        } else {
            message = "Maintenance mode OFF. Checks will resume as usual.";
        }
        return new SimpleMessage(this.alias, this.channel, message);
    }

    /**
     * @param  {TestResult[]} endpointsDown
     * @param  {int} totalNrOfEndpointsDown
     */
    buildNewEndpointsDownMessage(endpointsDown, totalNrOfEndpointsDown) {
        let attachments = Array();

        endpointsDown.forEach(r => {
                let attachment = {};
                attachment.collapsed = false;
                attachment.color = 'red';
                attachment.fields = Array();
                attachment.fields.push(
                    {
                        short: false,
                        title: "Name",
                        value: r.endpoint.friendlyName
                    },
                    {
                        short: false,
                        title: "URL",
                        value: r.endpoint.endpoint
                    },
                    {
                        short: true,
                        title: "Expected status",
                        value: r.endpoint.expectedStatus
                    },
                    {
                        short: true,
                        title: "Received status",
                        value: r.httpStatus
                    },
                    {
                        short: true,
                        title: "Response time",
                        value: `${r.responseTime} ms`
                    }
                );
                attachments.push(attachment);
            }
        );

        let message;
        if (totalNrOfEndpointsDown === endpointsDown.length) {
            if (endpointsDown.length === 1) {
                message = `There is 1 endpoint down.`;
            } else {
                message = `There are ${endpointsDown.length} endpoints down.`;
            }

        } else {

            if (endpointsDown.length === 1) {
                message = `There is ${endpointsDown.length} new endpoint down. It makes a total of ${totalNrOfEndpointsDown} endpoint(s) down.`;
            } else {
                message = `There are ${endpointsDown.length} new endpoints down. It makes a total of ${totalNrOfEndpointsDown} endpoint(s) down.`;
            }
        }

        return new MessageWithAttachments(this.alias, this.channel, message, attachments);
    }

    /**
     * @param  {TestResult[]} endpointsUp
     * @param  {int} totalNrOfEndpointsDown
     */
    buildNewEndpointsUpMessage(endpointsUp, totalNrOfEndpointsDown) {
        let attachments = Array();

        endpointsUp.forEach(r => {
                let attachment = {};
                attachment.collapsed = false;
                attachment.color = 'green';
                attachment.fields = Array();
                attachment.fields.push(
                    {
                        short: false,
                        title: "Name",
                        value: r.endpoint.friendlyName
                    },
                    {
                        short: false,
                        title: "URL",
                        value: r.endpoint.endpoint
                    }
                );
                attachments.push(attachment);
            }
        );

        let message;
        if (endpointsUp.length > 1) {
            message = `There are new ${endpointsUp.length} endpoints up `;
        } else {
            message = `There is new 1 endpoint up `;
        }

        if (totalNrOfEndpointsDown > 0) {
            if (totalNrOfEndpointsDown === 1) {
                message = `${message} but 1 is still down`;
            } else {
                message = `${message} but ${totalNrOfEndpointsDown} are still down`;
            }

        } else {
            message = `${message} and all is well!`;
        }

        return new MessageWithAttachments(this.alias, this.channel, message, attachments);
    }

}

class AbstractMessage {
    roomId;
    text;
    emoji;
    alias;

    constructor(alias, roomId, text, emoji = ":dog:") {
        this.alias = alias;
        this.emoji = emoji;
        this.roomId = roomId;
        this.text = text;
    }

}

class SimpleMessage extends AbstractMessage {
    constructor(alias, roomId, text) {
        super(alias, roomId, text, ":dog:");
    }
}

class MessageWithAttachments extends AbstractMessage {
    attachments;

    constructor(alias, roomId, text, attachments) {
        super(alias, roomId, text, ":dog:");
        this.attachments = attachments;
    }
}

module.exports = MessageFactory;
