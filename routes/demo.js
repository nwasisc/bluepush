
//home
exports.home = function(req, res){
	res.render('demo/home', { title: 'Home'});
};

//login
exports.login = function(req, res){
	res.render('demo/login', { title: 'User Login'});
};

//doLogin
exports.doLogin = function(req, res){
	var user = {
		username: req.body.username,
		password: req.body.password
	};
	req.session.user = user;
	return res.redirect('/demo/home');
/*
	var user={
		username:'admin',
		password:'admin'
	};
	if(req.body.username===user.username && req.body.password===user.password){
		req.session.user=user;
		return res.redirect('/demo/home');
	}else{
		req.session.error='Account or password is invalid.';
		return res.redirect('/demo/login');
	};
*/	
};

//logout
exports.logout = function(req, res){
	req.session.user=null;
	res.redirect('/demo/login');
};