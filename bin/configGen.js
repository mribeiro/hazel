#!/usr/bin/env node
const fs = require('fs');
const util = require('util');

//fs.readFileSync('/Users/aribeiro/Desktop/endpoints.csv').toString().split('\n').forEach(line =>  console.log(line));


var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('/Users/aribeiro/Desktop/endpoints.csv')
});

var endpoints = Array();

lineReader.on('line', function (line) {

    var obj = {};

    const params = line.split(';');

    obj.endpoint = params[0];
    obj.expectedStatus = parseInt(params[1]);
    obj.friendlyName = params[2];
    obj.headers = [];

    endpoints.push(obj);
    //console.log(endpoints);

    fs.writeFileSync('file.js', util.inspect(endpoints));

});


