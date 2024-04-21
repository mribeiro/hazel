const endpoints = [
    {
        endpoint: 'https://google.com',
        expectedStatus: 200,
        friendlyName: 'Google',
        headers: [{name: "my_custom_header", value: "5"}]
    },
    {
        endpoint: 'https://github.com',
        expectedStatus: 200,
        friendlyName: 'GitHub',
        headers: [],
        enabled: false
    }
];

const L = require('../utils/L');

function get() {
    const filteredEndpoints = endpoints.filter(endpoint => {
        if (endpoint.enabled === undefined) {
            return true;
        } else {
            return endpoint.enabled;
        }
    });
    L.info(`There are ${endpoints.length} configured, there are ${filteredEndpoints.length} enabled.`);
    return filteredEndpoints;
}

module.exports.get = get;
