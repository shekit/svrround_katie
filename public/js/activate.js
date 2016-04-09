$(document).ready(function(){

	//var socket_url = "http://localhost:3000"
	var socket_url = "http://45.55.213.136:80"

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
