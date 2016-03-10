$(document).ready(function(){
	console.log("Stream");
	var socket_url = "http://localhost:3000"
	var socket = io(socket_url + "/katiestream")

	var form = $("#chat-form");
	var chatMessage = $("#chat-message");

	var hearts = $("#hearts")

	form.on('submit', function(event){
		event.preventDefault();

		var message = chatMessage.val();

		if(message){
			socket.emit('chatMessage', message)
		}

		chatMessage.val("");
	})

	hearts.on('click', function(event){
		event.preventDefault();

		socket.emit('heartCount','one')
	})

	socket.on('recipe', function(msg){
		console.log("got recipe")
	})

	// get ip address
	$.getJSON("https://api.ipify.org?format=jsonp&callback=?",
      function(json) {
        console.log("My public IP address is: ", json.ip);
        socket.emit("ip", json.ip)
      }
    );


})