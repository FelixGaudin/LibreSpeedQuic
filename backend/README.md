# Backend

## Sources

Mainly inspired by the node backend on the [LibreSpeed](https://github.com/librespeed/speedtest/tree/node) project.

## Files

- `main.js` all the possible requests (GET and POST). Will listen on port 8888 by default. You can change it in the begining of the file.

- `helper.js` compute the distance between the server and the client.

- `database.js` include the [SQLite3](https://www.sqlite.org/index.html) database for telemetry.

- `secret.js` **NOT INCLUDED** The file where you store your login and your password in order to acces to the dashbord. The file should look like this :
```js
const LOGIN = "Your Login";
const PASSWORD = "Your password";

module.exports = {
    LOGIN : LOGIN,
    PASSWORD : PASSWORD
}
```

## How to launch

### Native

Just run `node main.js`. (You may have to install all the dependencies)

### Docker

We dockerized the backend. You may run it using these commands :

```bash
docker build -t <img name>
docker run -p 8888:8888 -d <img name>
```


