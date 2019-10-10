var express = require('express');
var http = require('http');
var fs = require('fs');
var app = express();
app.use(express.json());
app.use(express.text());
var port = 5050;
var jsonData = [];
var innerJsonData;
var logSplit = [];

app.post('/logsCreation', tableResponse);
app.get('/', function(req, res) {
    res.send('hello bardaoosh')
});

function tableResponse(req,res) {
    jsonData = [];
    let data = unescape(req.body).replace(/\+/g," ");
      console.log('req'+ unescape(req.body).replace(/\+/g," "));
        data = data.toString().split("\n");
        for (var singleLog in data) {
            logSplit.push(data[singleLog].split(" "));
            var typeData = 'none';
            for (var innerLogData in logSplit[singleLog]) {
                var logTime;
                switch (innerLogData) {
                    case '2':
                        logTime = logSplit[singleLog][innerLogData];
                        break;
                    case '9':
                        //console.log('<-------HERE-------->  '+innerLogData);

                        switch (logSplit[singleLog][innerLogData]) {
                            case 'sendRecommendationRequest':
                                typeData = 'Recommendation';
                                break;
                            case 'getSmartVariable':
                                typeData = 'Smart Variable';
                                break;
                            case 'setEvaluator':
                                typeData = 'Evaluator';
                                break;
                        }
                        break;
                    case '10':
                        var loglength = logSplit[singleLog].length;
                        var seperatesign;
                        var logData = logSplit[singleLog].slice(10, loglength).join(" ");
                        if (typeData != 'none') {
                            if (typeData == 'Recommendation' | typeData == 'Evaluator') {
                                var loopStop = false;
                                switch (typeData) {
                                    case 'Evaluator':
                                        seperatesign=")";
                                        break;
                                    case 'Recommendation':
                                        seperatesign="}";
                                        break;

                                }
                                console.log("singleLog of reccc " + singleLog);
                                for (z = 1; z < req.body.length - singleLog; z++) {
                                    var logIndex = parseInt(singleLog) + z;
                                    //console.log('z is '+ logIndex);
                                    //console.log('new log Data! '+data[logIndex]);

                                    //console.log('innerRecLogPart '+logData);
                                    for (var innerRecLogPart in data[logIndex]) {
                                        if (data[logIndex][innerRecLogPart].trim() == seperatesign) {

                                            loopStop = true;
                                            logData += seperatesign;
                                        }
                                    }
                                    //console.log("----------------------NEW LOG-------------------");
                                    if (loopStop) {
                                        break;
                                    }
                                    logData += data[logIndex];
                                }
                            }
                            jsonPush('logTime', logTime);
                            jsonPush('type', typeData);
                            jsonPush('data', logData);
                            typeData = 'none';
                            break;
                        }

                }
            }
            if (innerJsonData) {
                jsonData.push(innerJsonData);
                innerJsonData = null;
            }

        }
        console.log('log data   ' + JSON.stringify(jsonData));
    res.send(jsonData);
}
function jsonPush(logType, logContent) {
    if (!innerJsonData) {
        innerJsonData = {};
    }
    innerJsonData[logType] = logContent;
}




app.listen(port, start);

function start() {
    console.log('server started: ' + port);
}



app.post('/getLogs', getLogs);

function getLogs(req, res) {
    console.log("aaaaaa"+req)
    res.send(filter(req.body.filters, jsonData));
    console.log(JSON.stringify(req.body));
}

function filter(filters, data) {
    for (var key in filters) {
        var newData = [];
        if (filters[key] && filters[key].length === 0){
            continue;
        }
        for (var logLine of data) {
            console.log("filters[key] = " + filters[key]);
            console.log("logLine = " + JSON.stringify(logLine));
            newData = logFilter(logLine, newData, filters[key], logLine[key]);
        };
        data = newData;
    }
    return data;
}

function logFilter(log, newData, filters, prop) {
    for (var item of filters) {
        if (item === prop) {
            console.log("pushing " + JSON.stringify(log));
            newData.push(log);
        };
    }
    return newData;
}
app.get('/', function(req, res) {
    res.sendFile('index.html');
});

// app.listen(port);
// app.use('/', express.static('index'));
