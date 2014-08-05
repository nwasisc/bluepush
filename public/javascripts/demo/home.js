 var socket = io.connect();
 jQuery(function($){
	// submit form
	var sendMsgForm = $('#send-message');
	var subject = $('#subject');
	var message = $('#message');
	var sendto = $('#sendto');
	sendMsgForm.submit(function(event){
		if(subject.val() === '') {
			alert('Subject cannot be blank.');
			return false;
		}else if(message.val() === ''){
			alert('Message cannot be blank.');
			return false;
		}else{
			var obj = {
				subject: subject.val(), 
				message: message.val(),
				sendto: sendto.val()
			};
			socket.emit('message',obj);
			return false;
		};
	});
	// receive push-message from server;
	socket.on('push-message', function(data){
		//alert (data);
		sendMsgForm.append('Subject : ' + data.subject + '; ' + 'Message : ' + data.message + '; ');
	});
 });