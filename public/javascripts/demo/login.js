 var socket = io.connect();
 jQuery(function($){
	// submit form
	var LoginForm = $('#login');
	var username = $('#username');
	var password = $('#password');
	var obj = {
		username: username.val(),
		password: password.val()
	};
	LoginForm.submit(function(event){
		socket.emit('demoAddUser', obj);
	});
	// receive push-message from server;
	socket.on('push-message', function(data){
		//alert (data);
		sendMsgForm.append('Subject : ' + data.subject + '; ' + 'Message : ' + data.message + '; ');
	});
 });