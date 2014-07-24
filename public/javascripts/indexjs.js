 var socket = io.connect();
 jQuery(function($){
	// submit form
	var sendMsgForm = $('#send-message');
	var message = $('#message');
	sendMsgForm.submit(function(event){
		if(message.val() != '') {
			socket.emit('message', message.val());
			return false;
		} else {
			alert('Message cannot be blank.');
			return;
		}
	});
	// receive push-message from server;
	socket.on('push-message', function(data){
		//alert (data);
		sendMsgForm.append(data);
	});
 });