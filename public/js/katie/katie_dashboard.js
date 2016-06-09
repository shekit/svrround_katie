$(document).ready(function(){
	console.log("Katie Dashboard")


	//var socket_url = "http://localhost:3000"
	//var route_url = "http://localhost:3000"

	var socket_url = "http://45.55.213.136:80"
	var route_url = "http://45.55.213.136:80"

	var totalViewers = $("#totalViewers");
	var activeViewers = $("#activeViewers");
	var totalHearts = $("#totalHearts");
	var direction = $("#direction");
	var userList = $("#userList");
	
	var userStats = $("#userStats");
	var userHeartCount = $(".userHeartCount");
	var userDirection = $(".userDirection");
	var userActive = $(".userActive");

	var sendRecipe = $("#send-recipe")

	var locationList = $("#location-list")

	var socket = io(socket_url+'/katiedashboard');

	socket.on('stats', function(msg){
		totalViewers.html(msg['totalViewers']);
		activeViewers.html(msg['activeViewers']);
		totalHearts.html(msg['totalHearts']);
	})

	socket.on('direction', function(msg){
		direction.html(msg);
	})

	socket.on('user', function(msg){
		console.log("new user");
		var html = "<li><a href='#' class='user' data-val=" + msg + ">User</a></li>"
		userList.append(html)
	})

	socket.on('location', function(msg){
		if(msg){
			var location = '';

			if(msg.city){
				location += msg.city
			}

			if(msg.region){
				location += ', '+ msg.region;
			}	

			if(msg.country){
				location += ', '+msg.country
			}
			location += " |"

			locationList.prepend("<li>"+location+"</li>")
		}
	})

	$("body").on("click", "#send-recipe", function(event){
		event.preventDefault();
		socket.emit('recipe','this is my burrito recipe')
	})

	$("body").on('click', '.user', function(event){
		event.preventDefault();

		$.ajax({
			method: "POST",
			url: route_url + '/user/',
			data: {"id": $(event.target).attr('data-val')}
		})
		.done(function(response){
			userStats.show();
			userStats.html(response);
		})
		.fail(function(response){
			console.log(response);
		})
	})

	$("body").on("click", "#viewUsers", function(event){
		event.preventDefault();

		$.ajax({
			method: "GET",
			url: route_url + '/user-list'
		})
		.done(function(response){
			userList.html(response)
		})
		.fail(function(response){
			console.log(response)
		})
	})
})