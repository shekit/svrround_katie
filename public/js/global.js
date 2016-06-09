$(document).ready(function() {
	console.log("index page");

	var socket_url = "http://localhost:3000"
	// var socket_url = "http://45.55.213.136:80"
	var socket = io(socket_url + "/email")

	var form = $("#signup");

	var thanks = $(".thanks")

	var emailField = $(".email")

	form.on('submit', function(event) {
		event.preventDefault();

		var message = emailField.val();

		if (message) {
			socket.emit('email', message);

			//show thank you
			form.hide();
			thanks.show();
		}

		emailField.val("");
	})

})