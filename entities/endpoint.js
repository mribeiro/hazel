
class Endpoint {

    constructor(friendlyName, endpoint, headers, expectedStatus, timeout) {
        this.friendlyName = friendlyName;
        this.endpoint = endpoint;
        this.headers = headers;
        this.expectedStatus = expectedStatus;
        this.timeout = timeout;
    }
}

module.exports.Endpoint = Endpoint;
