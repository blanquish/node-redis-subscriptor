var redis = require("redis");

redis.debug_mode = false;

var express  = require("express");
var app      = express.createServer();
var sio = require('socket.io');

// Configure the app
app.configure(function() {
	app.use(express.methodOverride());
	app.use(express.bodyParser());
	app.use(app.router);
	app.use(express.static(__dirname + '/public'));
});

// Listen for requests
app.listen(3000);
console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);

var io = sio.listen(app);

io.sockets.on('connection', function (socket) {

    console.log("socket id [" + socket.id + "]");
    var redis_client = redis.createClient();
    redis_client.subscribe("c1");

    redis_client.on("subscribe", function (channel, count) {
        console.log("client subscribed to '" + channel + "', '" + count + "' total subscriptions");
    });

    redis_client.on("message", function(channel, message) {
    //	var data = JSON.parse(json);
        console.log("client received message '" + message + "'");
        socket.emit("message", message);
    });

    redis_client.on("error", function (err) {
        console.log("error event - " + redis_client.host + ":" + redis_client.port + " - " + err);
    });

    redis_client.on("unsubscribe", function (channel, count) {
        console.log("client2 unsubscribed from " + channel + ", " + count + " total subscriptions");
    });

});

io.configure( function() {
    io.set('close timeout', 60*60*24); // 24h time out
});
