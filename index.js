var http = require("http");
var url = require("url");
var express = require('express');
var path = require('path');
var app = express();
var mosca = require('mosca');
var server = require('http').Server(app);
var port = normalizePort(process.env.PORT || 8081);
app.set('port', port);
server.listen(port);
server.on('error', onError);
server.on('listening', onListening);
app.get('/',function(req,res){
    res.json('broker is runing');
})
function normalizePort(val) {
    var port = parseInt(val, 10);
    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}
function onError(error) {
    if (error.syscall !== 'listen') {
    throw error;
    }
    var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;
    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}
function onListening(req, res) {
    var addr = server.address();
    var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
    console.log('Listening on ' + bind);  
}


function parseJSONorNot(mayBeJSON) {
	if (typeof mayBeJSON === 'string') {
		return JSON.parse(mayBeJSON);
	} else {
		return mayBeJSON;
	}
}
var privateID = '127.0.0.1';
// var privateID = '206.81.5.97';
// var privateID = '10.10.0.5';

var SECURE_KEY = path.join(__dirname, 'vault-key.pem')
var SECURE_CERT = path.join(__dirname, 'vault-cert.pem')
//Private IP address
var pubsubsettings = {
    type: 'mqtt',
    json: true,
    mqtt: require('mqtt'),
    host: privateID,
    port: 1883,
    secure: {
      port: 8883,
      keyPath: SECURE_KEY,
      certPath: SECURE_CERT
    },
    http: {
      port: 3001,
      bundle: true,
      static: "./"
    },
    https: {
      port: 3000,
      bundle: true,
      static: "./"
    },
    allowNonSecure: true,
    onlyHttp: false
};

var moscaServer = new mosca.Server(pubsubsettings);
var credential = {
    username: "rpdyuoao",
    password: "HdszCokz_6uB"
}
var authenticate = function(client, username, password, callback) {
    var authorized = (username === credential.username && password.toString() === credential.password);
    if (authorized) client.user = username;
    callback(null, authorized);
  }
  var authorizePublish = function(client, topic, payload, callback) {
    callback(null, client.user == topic.split('/')[1]);
  }
  var authorizeSubscribe = function(client,topic, callback) {
    callback(null, client.user == topic.split('/')[1]);
  }
// fired when the mqtt moscaServer is ready
function setup() {
  console.log('Mosca moscaServer is up and running');
  moscaServer.authenticate = authenticate;
  moscaServer.authorizePublish = authorizePublish;
  moscaServer.authorizeSubscribe = authorizeSubscribe;
}
moscaServer.on('clientConnected', function(client) {
    console.log('client connected', client.id + ' ' + new Date().toISOString());
});
moscaServer.on('published', function(packet, client) {     
    console.log('client published', packet.topic.replace('presence/7kvhq5sf8uf52yimz6lhnk25yhmwp5im/', ''),new Date().toISOString());
});
moscaServer.on('ready', setup);

module.exports = app;
