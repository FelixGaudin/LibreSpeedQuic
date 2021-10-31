// inspired by https://developerhowto.com/2018/12/29/build-a-rest-api-with-node-js-and-express-js/

var sqlite3 = require('sqlite3').verbose()

const DBSOURCE = "telemetry.sqlite"

let db = new sqlite3.Database(DBSOURCE, (err) => {
    if (err) {
      // Cannot open database
      console.error(err.message)
      throw err
    }else{
        console.log('Connected to the SQLite database.')
        db.run(`CREATE TABLE IF NOT EXISTS telemetry (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp INTEGER,
            dl          text, 
            ul          text, 
            ping        text, 
            jitter      text,
            ip          text,
            ass         text,
            country     text,
            distance    text,
            httpversion text
            )`,
        (err) => {
            console.log("Hello");
            if (err) {
                console.log(err);
                // Table already created
            }else{
                // Table just created, creating some rows
                // var insert = 'INSERT INTO telemetry (dl, ul, ping, jitter, ip, ass, country, distance) VALUES (?,?,?,?,?,?,?,?)'
                // db.run(insert, ["54.13", "39.13", "7.00", "1.95", "213.213.216.132", "AS12392", "BE", "0.000"])
                // console.log("coucou");
            }
        });  
    }
});


module.exports = db
