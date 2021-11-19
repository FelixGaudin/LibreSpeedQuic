const express = require('express');
const Server = express();
const randomBytes = require('random-bytes');
const path = require('path');
const request = require('request');
const helpers = require('./helpers');
const cors = require('cors');
const bodyParser = require('body-parser')
var multer = require('multer');
var upload = multer();

var db = require('./database.js');
const SECRET = require('./secret.js');

const PORT = 8888

let cache;

// https://stackoverflow.com/questions/24800511/express-js-form-data
Server.use(bodyParser.json());
Server.use(bodyParser.urlencoded());
// in latest body-parser use like below.
Server.use(bodyParser.urlencoded({ extended: true }));

// https://www.tutorialspoint.com/expressjs/expressjs_form_data.htm
Server.use(upload.array()); 
Server.use(express.static('public'));

Server.use(cors());

Server.get('/empty', function (req, res) {
  res.status(200).send('');
});

Server.post('/empty', function (req, res) {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0");
    res.set("Cache-Control", "post-check=0, pre-check=0");
    res.set("Pragma", "no-cache");
    res.status(200).send('');
});

Server.get('/garbage', function (req, res) {
    res.set('Content-Description', 'File Transfer');
    res.set('Content-Type', 'application/octet-stream');
    res.set('Content-Disposition', 'attachment; filename=random.dat');
    res.set('Content-Transfer-Encoding', 'binary');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.set('Cache-Control', 'post-check=0, pre-check=0', false);
    res.set('Pragma', 'no-cache');
    const requestedSize = (req.query.ckSize || 100);

    const send = () => {
        for (let i = 0; i < requestedSize; i++)
            res.write(cache);
        res.end();
    }

    if (cache) {
        send();
    } else {
        randomBytes(1048576, (error, bytes) => {
            cache = bytes;
            send();
        });
    }

});

Server.get('/getIP', function (req, res) {
    let requestIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.headers['HTTP_CLIENT_IP'] || req.headers['X-Real-IP'] || req.headers['HTTP_X_FORWARDED_FOR'];
    if (requestIP.substr(0, 7) === "::ffff:") {
        requestIP = requestIP.substr(7)
    }
    request('https://ipinfo.io/' + requestIP + '/json', function (err, body, ipData) {
        ipData = JSON.parse(ipData);
        if (err) res.send(requestIP);
        else {
            request('https://ipinfo.io/json', function (err, body, serverData) {
                serverData = JSON.parse(serverData);
                if (err) res.send(`${requestIP} - ${ipData.org}, ${ipData.country}`);
                else if (ipData.loc && serverData.loc) {
                    const d = helpers.calcDistance(ipData.loc.split(','), serverData.loc.split(','));
                    let toSend = {
                        processedString : `${requestIP} - ${ipData.org}, ${ipData.country} (${d}km)`,
                        rawIspInfo : {
                            ip : requestIP,
                            as : ipData.org,
                            country : ipData.country,
                            distance : d
                        }
                    }
                    res.send(JSON.stringify(toSend));
                } else {
                    res.send(`${requestIP} - ${ipData.org}, ${ipData.country}`);
                }
            })
        }
    });
});

Server.post('/telemetry', function (req, res) {
    let requestBody = req.body;
    
    toLog = {};
    
    toLog.dl          = requestBody.dl;
    toLog.ul          = requestBody.ul;
    toLog.ping        = requestBody.ping;
    toLog.jitter      = requestBody.jitter;
    toLog.httpversion = requestBody.httpversion;
    toLog.browser     = requestBody.browser;
    toLog.uln         = requestBody.uln;
    toLog.dln         = requestBody.dln;

    try {
        let data = JSON.parse(requestBody.ispinfo).rawIspInfo
        
        toLog.ip       = data.ip
        toLog.as       = data.as
        toLog.country  = data.country
        toLog.distance = data.distance
    
    } catch (e) {
        // cannot parse the json
        // wsh c'est la flemme
        console.log("Flemme");
    }

    // console.log(toLog);
    // log in the db
    var insert = 'INSERT INTO telemetry (timestamp, dl, ul, ping, jitter, ip, ass, country, distance, httpversion, browser, uln, dln) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)'
    db.run(insert, [
        Date.now(),
        toLog.dl, 
        toLog.ul, 
        toLog.ping, 
        toLog.jitter,
        toLog.ip,
        toLog.as, 
        toLog.country, 
        toLog.distance,
        toLog.httpversion,
        toLog.browser,
        toLog.uln,
        toLog.dln
    ])

    res.status(200).send('');
})

Server.get("/getdb", function (req, res) {

    if (SECRET.LOGIN == req.query.login && SECRET.PASSWORD == req.query.password) {
        console.log('acces');
        db.all("SELECT * FROM telemetry", function(err, rows) {  
            if (err) throw err
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({data : rows}))
        });
    } else {
        console.log("WRONG");
        res.status(403).send({
            message : 'Bad credentials'
        })
    }
})

// Only for localhost usage
Server.get("/database.sqlite", function (req, res) {
    let options = {
        root : path.join(__dirname)
    }
    res.sendFile('telemetry.sqlite', options, (err) => {
        if (err) throw err;
    })
})


Server.use(express.static(path.join(__dirname, 'public')));

Server.listen(PORT, function () {
    console.log('Speedtest Server is up and running!');
});