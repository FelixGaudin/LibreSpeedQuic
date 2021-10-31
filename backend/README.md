# Backend

## Sources

Mainly inspired by the node backend on the [LibreSpeed](https://github.com/librespeed/speedtest/tree/node) project.

## Files

- `main.js` all the possible requests (GET and POST). Will listen on port 8888 by default. You can change it in the begining of the file.

- `helper.js` compute the distance between the server and the client.

- `database.js` include the [SQLite3](https://www.sqlite.org/index.html) database for telemetry.

## How to launch

### Native

Just run `node main.js`. (You may have to install all the dependencies)

### Docker

We dockerized the backend. You may run it using this command :
docker run -p 8888:8888 -d adribr/backend_grpg

