$(document).ready(function(){
	console.log("Stream");
	var socket_url = "http://localhost:3000"
	var socket = io(socket_url + "/katiestream")
})