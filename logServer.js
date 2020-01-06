var express = require('express');
//var formidable = require('formidable');
var app = express();
var multer = require('multer');
var upload = require ('express-fileupload');
app.use(upload());
app.use(express.json());
app.use(express.text());
var fs = require('fs');
var port = 80;
//var http  = require("http").Server(app).listen(80);
var jsonData = [];
var innerJsonData;
var logSplit = [];
var month = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'July', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec'];
var currentMonth;
app.get("/",function(req,res){
res.sendFile(__dirname+"table.html");

})
let data; // the raw logs data
let firstChars; //First charts to spit the logs

app.post("/",function(req,res){
    if(req.files){
        console.log("filename " + JSON.stringify (req.files.filename.name));
    var theFile = req.files.filename,
    filename = JSON.stringify(req.files.filename.name).replace(/['"]+/g, '');    ;
    theFile.mv("./uploadfiles/"+filename,function(err){
     if(err){
console.log(err)
res.send("error occoured");

    }
    else{
        //res.send('File was uploaded sucessfuly');
        fs.readFile('logsTxt', 'utf8', function(err, fileData) {
            if (err) throw err;
            data = unescape(fileData).replace(/\+/g, " ");
            firstChars = fileData.substring(0, 20);
            tableResponse(req,res);
        });
        
    }


    })

    

    }
    
    })

app.post('/logsCreation', tableResponse);

function getIndexRow(data) {
    for (let index = 0; index < data.length; index++) {
        if (data[index].indexOf('DYLogger:') + 11 == data[index].indexOf('<DYDeveloper>')) {
            
            console.log('index is '+ index);
            return index
        }
    }
}

function tableResponse(req, res) {
    //console.log(data);
    jsonData = [];
    logSplit = [];
    if (!data){ //means the no file was uploaded (otherwise 'data' was true)
        data = unescape(req.body).replace(/\+/g, " ");
        firstChars = req.body.substring(0, 20)
        //console.log('data is: '+ data)
        //console.log('<--------------------------------HERE----------------------------------->')

    }
    for (i = 0; i < month.length; i++) {
        firstChars.toLowerCase().indexOf(month[i].toLowerCase()) != -1 ? currentMonth = month[i] : false
    }
    data = data.toString().split("\n" + currentMonth)
    var indexes = []
    var rowIndex = getIndexRow(data);
    console.log('rowIndex is: '+ rowIndex)
    for (var word of data[rowIndex].split(" ")) {
        indexes.push(word)
    }
    var logType1 = (indexes.indexOf('DYLogger:') + 3).toString();
    var logMessage1 = (indexes.indexOf('DYLogger:') + 4).toString();
    var HHMMSSregex =new RegExp ('([0-1]?[0-9]|[2][0-3]):([0-5][0-9])(:[0-5][0-9])');
    for (let logitemNum = 0; logitemNum < indexes.length; logitemNum++) {
        
        if(HHMMSSregex.test(indexes[logitemNum])) {
            var  logTime1 = logitemNum.toString();
            break;
        }
        };

    for (var singleLog in data) {
        logSplit.push(data[singleLog].split(" "));
        var typeData = 'none';



        for (var innerLogData in logSplit[singleLog]) {

            var logTime;
            switch (innerLogData) {
                
                case logTime1:
                    logTime = logSplit[singleLog][innerLogData];
                    //console.log('logTime IS '+ logTime);
                    break;
                case logType1:   
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
                        case 'trackEvent':
                            typeData = 'Event';
                            break;
                    }

                case logMessage1:
                    var loglength = logSplit[singleLog].length;
                    var logData = logSplit[singleLog].slice(10, loglength).join(" ");
                    if (typeData != 'none') {
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
    data = "";
    res.send(jsonData);
}
function jsonPush(logType, logContent) {
    if (!innerJsonData) {
        innerJsonData = {};
    }
    innerJsonData[logType] = logContent;

}


app.listen(port, console.log('server started: ' + port));


app.post('/getLogs', getLogs);

function getLogs(req, res) {
    res.send(filter(req.body.filters, jsonData));
}

function filter(filters, data) {
    var filtered = data.filter(row => g(row))
    function g(row) {
        if (filters.type.length === 0) {
            return true;
        } else if (filters.type.length === 1) {
            return row.type == filters.type
        } else {
            for (var i = 0; i < filters.type.length; i++) {
                if (row.type == filters.type[i]) {
                    return true;
                }
            }
        }
    }
    return filtered;
}

app.use('/table', express.static('table'));
