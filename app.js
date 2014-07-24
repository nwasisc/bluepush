
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
};

// create server
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

//connect mongodb
mongoose.connect('mongodb://localhost/BP_DB');

var Schema = mongoose.Schema;
var acctSchema = new Schema ({
	group: String,
	account: String});
	
var Account = mongoose.model('Account', acctSchema);
//Account.create({group: 'Group2', account: 'ACCT3'});
//routes
app.get('/', routes.index(Account));

// require socket.io module
var io = require('socket.io')(server);
//io.sockets.on('connection', function(socket){
io.on('connection',function(socket){
	socket.on('message', function(data){
		socket.broadcast.emit('push-message', data);
		console.log('Message is ' + data);
	});
	
	socket.on('disconnect', function(){ });
});


