$(document).ready(function(){
	console.log("Chat!!")
	var socket_url = "http://localhost:3000"
	//var socket_url = "http://45.55.213.136:80"

	var socket = io(socket_url + "/katiechat")

	var placeholder = $(".placeholder-text")

	var messageList = $("#chat-messages")


	socket.on('chatMessage', function(data){

		if(placeholder.is(":visible")){
			placeholder.hide();
		}

		var li = "<li>"+data.user.name + ": " + data.message +"</li>"

		messageList.prepend(li)
	})



})