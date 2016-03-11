$(document).ready(function(){
	var socket_url = "http://128.122.6.128:3000"
	var socket = io(socket_url + "/startstream")

	$("body").on('click', '#activate', function(event){
		event.preventDefault();

		socket.emit('activate','yes')
	})

	$("body").on('click', '#deactivate', function(event){
		event.preventDefault();

		socket.emit('deactivate','yes')
	})


})