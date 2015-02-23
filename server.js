var connect = require('connect');
var serveStatic = require('serve-static');
var bodyParser = require('body-parser');
var fs = require('fs');
var schedule = require('node-schedule');
var lirc = require('lirc_node');
lirc.init();

var app = connect();

var scheduleds = {};

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

app.use('/wecker', function wecker(req, res) {

    switch (req.method) {
        case 'GET':
            getWecker(req, res);
            break;
        case 'POST':
            putWecker(req, res);
            break;
        case 'PUT':
            putWecker(req, res);
            break;
        case 'DELETE':
            deleteWecker(req, res);
            break;
    }
    res.end();
});

function getWecker(req, res) {
    var files = fs.readdirSync('data');
    var weckers = [];
    files.forEach(function (fileName) {
        var file = fs.readFileSync('data/' + fileName);
        weckers.push(JSON.parse(file));
    });
    res.write(JSON.stringify(weckers));
}

function putWecker(req, res) {

    var toAdd = parseName('/wecker/', req.url);
    var wecker = req.body;
    console.log(wecker);
    var weck = JSON.stringify(wecker, null, 2);
    console.log(weck);

    fs.writeFile('data/' + toAdd, weck);
    res.end(weck);
    cancelWecker(toAdd);
    scheduleWecker(wecker, function () {
        sendIR(wecker.action);
    },toAdd);
}

function deleteWecker(req, res) {
    var toDelete = parseName('/wecker/', req.url);
    fs.unlink('data/' + toDelete, function (err) {
        console.log(err);
    });
    res.end(toDelete);
    cancelWecker(toDelete);
}

function parseName(base, url) {
    return url.replace(base, '').replace('?', '');
}

app.use('/infra', function (req, res) {
    var cmd = parseName('/infra/', req.url).replace('/','');
    sendIR(cmd);
    res.end();
});

function sendIR(command) {
    lirc.irsend.send_once("wecker", command.replace('/',''), function () {
        console.log("Sent command " + command);
    });
}

function scheduleWecker(wecker, job, name) {
    var sched;
    if (wecker.recurring) {
        sched = new schedule.RecurrenceRule();

        ['year', 'month', 'day', 'dayOfWeek', 'hour', 'minute'].forEach(function (curr) {
            if (wecker[curr]) {
                sched[curr] = wecker[curr];
            }
        });
    } else {
        sched = new Date(wecker.year, wecker.month, wecker.day, wecker.hour, wecker.minute);
    }
    scheduleds[name] = schedule.scheduleJob(sched, job);
    if (scheduleds[name])
        console.log('scheduled ' + name + JSON.stringify(scheduleds[name]) +", " + JSON.stringify(sched));
    else
        console.log('NOT scheduled ' + name);

}

function cancelWecker(name) {
    if (scheduleds[name]) {
        scheduleds[name].cancel();
        console.log("Cancelled: " + name);
    } else {
        console.log( name + " not cancelled -> was not scheduled");
    }
}

app.use(serveStatic('www')).listen(8080);
