$(document).ready(function(){
	console.log("Chat")
	var socket_url = "http://128.122.6.128:3000"
	var socket = io(socket_url + "/katiechat")

	var placeholder = $(".placeholder-text")

	var messageList = $("#chat-messages")

	socket.on('chatMessage', function(msg){

		if(placeholder.is(":visible")){
			placeholder.hide();
		}

		var li = "<li>"+msg+"</li>"

		messageList.prepend(li)
	})
})