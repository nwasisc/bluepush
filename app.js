
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var sio = require('socket.io');
var connect = require('express/node_modules/connect');
var	cookie = require('express/node_modules/cookie');
var	MongoStore = require('connect-mongo')(express);
//var hash = require('./pass').hash;
//var parseCookie = require('connect').utils.parseCookie;
//var storeMemory = new express.session.MemoryStore({
//		reapInterval: 60000 * 10
//	});
//var sessionStore = new express.session.MemoryStore({reapInterval: 60000 * 10});



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

//app.use(express.cookieSession({secret: 'fens.me'}));
var sessionStore = new MongoStore({
	db: 'ppd',
	//host: '127.0.0.1',
	host:'ds033069.mongolab.com',
	port:'33069',
	username:'ppd',
	password:'111111',
},function(e){
	app.use(express.cookieParser('fens.me'));
	app.use(express.session({
	store: sessionStore,
	secret: 'fens.me'
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
	res.end;
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
 
//routes
app.get('/', routes.index);
//app.get('/user/signup', routes.signup);
//app.post('/user/signup', routes.doSignup);
app.all('/user/login', notAuthentication);
app.get('/user/login', routes.login);
app.post('/user/login', routes.doLogin);
app.get('/user/logout', authentication);
app.get('/user/logout', routes.logout);
app.get('/home', authentication);
app.get('/home', routes.home);
app.get('/aboutUs',function(req,res){
  res.render('aboutUs',{ title: 'About Us' });
});


//--------------------------------------------------DEMO----------------------------------------------------------//
var demo = require('./routes/demo');

app.all('/demo/login', demo_notAuthentication);
app.get('/demo/login', demo.login);
app.post('/demo/login', demo.doLogin);
app.get('/demo/logout', demo_authentication);
app.get('/demo/logout', demo.logout);
app.get('/demo/home', demo_authentication);
app.get('/demo/home', demo.home);

function demo_authentication(req, res, next) {
	if (!req.session.user) {
		req.session.error='Please log in first.';
		return res.redirect('/demo/login');
	}
	next();
}
function demo_notAuthentication(req, res, next) {
	if (req.session.user) {
		req.session.error='You have been logged in.';
		return res.redirect('/demo/home');
	}
	next();
}

//-------------------------------------------------DEMO END-------------------------------------------------------//

// require socket.io module
var io = sio.listen(server);
var usersWS = {};
io.set('authorization', function(handshakeData, callback){
	console.log(handshakeData);
	//handshakeData.cookie = parseCookie(handshakeData.headers.cookie);
	handshakeData.cookie = connect.utils.parseSignedCookies(cookie.parse(decodeURIComponent(handshakeData.headers.cookie)),'fens.me');
	console.log(handshakeData.cookie);
	var sessionid = handshakeData.cookie['connect.sid'];
	console.log(sessionid);
	if (sessionid) {
		//var sid = '';
		//sid = sessionid.split(':')[1].split('.')[0];
		var sid = sessionid;
		console.log('SID ' + sid); 
		sessionStore.get(sid, function(error, session){
			if (error) {
				callback(error.message, false);
			} else {
				handshakeData.session = session;
                callback(null, true);
			};
		});
	} else {
		callback('nosession');
	};
});

//io.sockets.on('connection', function(socket){
io.sockets.on('connection',function(socket){
	var session = socket.handshake.session;
	var user = session.user.username;
	console.log(user);
	usersWS[user] = socket;
	
	socket.on('message', function(data){
		var obj = {
			subject: data.subject,
			message: data.message,
			sendto: data.sendto
		};
		var target = usersWS[obj.sendto];
		console.log(obj.sendto);
		if (target) {
			console.log(target);
			target.emit('push-message', data);
		}
		//msgModel.create(obj);
		//socket.broadcast.emit('push-message', data);
	});
	
	socket.on('disconnect', function(){ 
		delete usersWS[user];
		session = null;
		console.log(user + ' has been logged off.');
	});
});
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
