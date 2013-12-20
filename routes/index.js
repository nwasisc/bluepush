
/*
 * GET home page.
 */
exports.home = function(Account){
	return function(req, res){
		Account.find({}, function(err, docs){
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
};

//signup
exports.signup = function(req, res){
	if (req.session.user) {
		return res.redirect('/home');
	} else {
	res.render('signup', {title: 'Sign Up'});
	};
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