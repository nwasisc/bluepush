
/*
 * GET home page.
 */
var mongoose = require('mongoose');
//connect mongodb
mongoose.connect('mongodb://ppd:111111@ds033069.mongolab.com:33069/ppd');

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
 
exports.home = function(req, res){
	Group.find({}, function(err, docs){
		var groups = new Array();
		var j = 0;
		for (var i=0; i<docs.length; i++) {
			if (i === 0) {
				groups[j] = docs[i].group;
				j = j + 1
			}else{
				if (docs[i].group !== groups[j-1]) {
					groups[j] = docs[i].group;
					j = j + 1;
				};
			};
		};
		groups.sort();
		console.log('groups : ' + groups);
		res.render('home', { title: 'Home', groups: groups });
	});
};

//signup
exports.signup = function(req, res){
	if (req.session.user) {
		return res.redirect('/home');
	} else {
	res.render('signup', {title: 'Sign Up'});
	};
};

//doSignup
/*
exports.doSignup = function(req, res, next){
	Account.count({
		account: req.body.username
	}, function(err, count){
			if (count === 0) {
				next();
			} else {
				req.session.error = 'Account Exit';
				res.redirect('/user/signup');
			};
	});
	var account = req.body.username,
		password = req.body.password;
	

};
*/
exports.doSignup = function(req, res){
	//userExist;
	
    var password = req.body.password;
    var username = req.body.username;

    hash(password, function (err, salt, hash) {
        if (err) throw err;
        var account = new Account({
            account: username,
            salt: salt,
            hash: hash,
        }).save(function (err, newUser) {
            if (err) throw err;
            authenticate(newUser.username, password, function(err, user){
                if(user){
                    req.session.regenerate(function(){
                        req.session.user = user;
                        req.session.success = 'Authenticated as ' + user.username + ' click to <a href="/logout">logout</a>. ' + ' You may now access <a href="/restricted">/restricted</a>.';
                        res.redirect('/home');
                    });
                }
            });
        });
    });
};

//login
exports.login = function(req, res){
	res.render('login', { title: 'User Login'});
};

//doLogin
exports.doLogin = function(req, res){
	var user={
		username:'admin',
		password:'admin'
	};
	if(req.body.username===user.username && req.body.password===user.password){
		req.session.user=user;
		return res.redirect('/home');
	}else{
		req.session.error='Account or password is invalid.';
		return res.redirect('/user/login');
	};	
};

//logout
exports.logout = function(req, res){
	req.session.user=null;
	res.redirect('/');
};
exports.index = function(req, res){
	res.render('index', { title: 'Index'});
};


exports.ppt = function(req, res){
  res.render('ppt');
};


function userExist(req, res, next) {
    Account.count({
        account: req.body.username
    }, function (err, count) {
        if (count === 0) {
            next();
        } else {
            req.session.error = "User Exist"
            res.redirect("/user/signup");
        }
    });
};

function authenticate(name, pass, fn) {
    if (!module.parent) console.log('authenticating %s:%s', name, pass);

    Account.findOne({
        account: name
    },
    function (err, user) {
        if (user) {
            if (err) return fn(new Error('cannot find user'));
            hash(pass, user.salt, function (err, hash) {
                if (err) return fn(err);
                if (hash == user.hash) return fn(null, user);
                fn(new Error('invalid password'));
            });
        } else {
            return fn(new Error('cannot find user'));
        }
    });
};

var crypto = require('crypto');

/**
 * Bytesize.
 */

var len = 128;

/**
 * Iterations. ~300ms
 */

var iterations = 12000;

/**
 * Hashes a password with optional `salt`, otherwise
 * generate a salt for `pass` and invoke `fn(err, salt, hash)`.
 *
 * @param {String} password to hash
 * @param {String} optional salt
 * @param {Function} callback
 * @api public
 */

function hash(pwd, salt, fn) {
  if (3 == arguments.length) {
    crypto.pbkdf2(pwd, salt, iterations, len, fn);
  } else {
    fn = salt;
    crypto.randomBytes(len, function(err, salt){
      if (err) return fn(err);
      salt = salt.toString('base64');
      crypto.pbkdf2(pwd, salt, iterations, len, function(err, hash){
        if (err) return fn(err);
        fn(null, salt, hash);
      });
    });
  }
};