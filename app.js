
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');
var SessionStore = require("session-mongoose")(express);
var store = new SessionStore({
	url: 'mongodb://localhost/session',
	interval: 120000
});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser());
app.use(express.cookieSession({secret: 'fens.me'}));
app.use(express.session({
	secret: 'fens.me',
	store: store,
	cookie: {maxAge: 900000}
}));
app.use(function(req, res, next){
	res.locals.user = req.session.user;
	var err = req.session.error,
		msg = req.session.success;
	delete req.session.error;
	delete req.session.success;
	res.locals.message = '';
	if (err) res.locals.message = err;
	if (msg) res.locals.message = msg;
	next();
});
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
	account: String,
	password: String,
	salt: String,
	hash: String
});

var Account = mongoose.model('Account', acctSchema);

var groupSchema = new Schema ({
	group: String,
	account: Array
});
var Group = mongoose.model('Group', groupSchema);

var msgSchema = new Schema ({
	group: String,
	subject: String,
	message: String,
	sendby: String,
	sendon: { type: Date, default: Date.now}
});
msgModel = mongoose.model('Message', msgSchema);

//routes
app.get('/', routes.index);

app.get('/user/signup', routes.signup);
app.post('/user/signup', routes.doSignup);
app.all('/user/login', notAuthentication);
app.get('/user/login', routes.login);
app.post('/user/login', routes.doLogin);
app.get('/user/logout', authentication);
app.get('/user/logout', routes.logout);
app.get('/home', authentication);
app.get('/home', routes.home(Account));

// require socket.io module
var io = require('socket.io')(server);
//io.sockets.on('connection', function(socket){
io.on('connection',function(socket){
	socket.on('message', function(data){
		var obj = {
			group: data.group,
			subject: data.subject,
			message: data.message
		};
		msgModel.create(obj);
		
		socket.broadcast.emit('push-message', data);
	});
	
	socket.on('disconnect', function(){ });
});

function authentication(req, res, next) {
	if (!req.session.user) {
		req.session.error='Please log in first.';
		return res.redirect('/user/login');
	}
	next();
}
function notAuthentication(req, res, next) {
	if (req.session.user) {
		req.session.error='You have been logged in.';
		return res.redirect('/home');
	}
	next();
}
