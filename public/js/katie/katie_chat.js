$(document).ready(function(){
	console.log("Chat")
	var socket_url = "http://localhost:3000"
	var socket = io(socket_url + "/katiechat")
})