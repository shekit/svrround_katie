var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');
var twit = require('twit');

var config = require('./config/config-dev.js')

//var T = new twit(config);

var jsonfile = require('jsonfile');
var util = require('util');
jsonfile.spaces = 4;


// var nodemailer = require('nodemailer');
// var mandrillTransport = require('nodemailer-mandrill-transport')
// var mandrill = require('./config/config-dev.js')

// var transport = nodemailer.createTransport(mandrillTransport({
// 	auth: {
// 		apiKey: mandrill.mandrill_api_key
// 	}
// }))



//send mail to us with data for backup 
var CronJob = require('cron').CronJob;

var job = new CronJob('0 0 14 11 2 *', function() {

	transport.sendMail({
		from: 'team@svrround.com',
		to: 'abhishek3188@gmail.com',
		subject: 'svrround data',
		text: JSON.stringify(viewerStats), // make sure var is defined before calling this
	}, function(err) {
		console.log(err);
	})
}, null, true, 'America/New_York')

// send another mail for backup
var new_job = new CronJob('0 0 15 11 2 *', function() {

	transport.sendMail({
		from: 'team@svrround.com',
		to: 'abhishek3188@gmail.com',
		subject: 'svrround data',
		text: JSON.stringify(viewerStats), // make sure var is defined before calling this
	}, function(err) {
		console.log(err);
	})
}, null, true, 'America/New_York')


var dbfile = '/data/data.json'

var emaildb = '/data/emails.json'

var routes = require('./routes/index');
var katie = require('./routes/katie');

var geoip = require('geoip-lite');

var app = express();

var http = require('http').Server(app);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.use(function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//   next();
// });

app.use(cors());

app.use('/', routes);
app.use('/live', katie);


//get individual user stats
app.post('/user', function(req, res, next) {
	var id = req.body.id;
	var heartCount = userHeartCount(id);
	var direction = findAvgUserDirection(id);
	var active = viewerStats[id]["active"]
	var duration = null;
	if (active) {
		//return duration in seconds
		duration = parseInt((new Date - viewerStats[id]["joined"]) / 1000);
	} else {
		duration = parseInt((viewerStats[id]["left"] - viewerStats[id]["joined"]) / 1000);
	}
	res.render('user_details.jade', {
		"heartCount": heartCount,
		"direction": direction,
		"active": active,
		"duration": duration
	})
})

app.get('/user-list', function(req, res, next) {
	//res.json({"userList": activeUserList()})
	res.render("user_list.jade", {
		"users": activeUserList()
	})
})

//********* SOCKET STUFF  **********//

var io = require('socket.io')(http);


var katiestreamio = io.of('/katiestream');

var katiechatio = io.of('/katiechat');

var katiedashboardio = io.of('/katiedashboard');

var isActive = false;

var startstreamio = io.of('/startstream');

startstreamio.on('connection', function(socket) {
	console.log("Trigger page connected")

	socket.on('activate', function(data) {
		isActive = true;
		katiestreamio.emit('activate', 'yes')
		console.log("Activated Stream")
	})

	socket.on('deactivate', function(data) {
		isActive = false;
		katiestreamio.emit('deactivate', 'yes')
		console.log("Deactivated stream")
	})

	socket.on('full-deactivate', function(data) {
		isActive = false;
		katiestreamio.emit('full-deactivate', 'yes')
		console.log("Deactivated stream")
	})

})

// SAVE VIEWER stats - eventually move to DB
var viewerStats = {};

// io for live stream page
katiestreamio.on('connection', function(socket) {

	socket.on('tweet', function(data) {

		console.log('got tweet', data)

		var fromUser = data.fromUser;
		var toUser = data.toUser;

		if (fromUser[0] === '@') fromUser = toUser.substring(1, fromUser.length)
		if (toUser[0] === '@') toUser = toUser.substring(1, toUser.length)

		console.log('tweet from ', fromUser, ' to ', toUser);

		T.post('statuses/update', {
			status: '@' + fromUser +' come watch this live 360 stream with me,  @' +  fromUser + '! http://svrround.com/live'
		}, function(data) {
			console.log('tweeted successfuly');

		});

	})

	console.log("New viewer for katie")

	viewerStats[socket.id] = {
		"heartCount": 0,
		"joined": new Date(),
		"left": null,
		"ip": "",
		"location": "",
		"active": true,
		"creator": null,
		"admin": false,
		"messages": [],
		"direction": [{
			"x": 0,
			"y": 0,
			"z": 1
		}],
		"reaction":{
			"grinning":0,
			"crying":0,
			"hearteyes":0,
			"astonished":0
		}
	}

	//send updated stats to katie's dashboard
	emitUserStats();

	// emit status of live stream to the client
	socket.on('isActive', function(data) {
		socket.emit("status", isActive)
	})

	socket.on('chatMessage', function(data) {
		viewerStats[socket.id]["messages"].push(data);
		console.log(viewerStats[socket.id]["messages"])
		katiechatio.emit("chatMessage", data);
		katiestreamio.emit("chatMessage", data);
	})

	socket.on('ip', function(data) {
		console.log(data)
		console.log(typeof data);
		viewerStats[socket.id]["ip"] = data;
		var geo = geoip.lookup(data);
		viewerStats[socket.id]["location"] = geo;
		katiedashboardio.emit("location", geo);
	})

	socket.on('heartCount', function(data) {
		//viewerStats[socket.id]["heartCount"] = data["heartCount"];
		viewerStats[socket.id]["heartCount"] += 1;
		console.log("USER HEART COUNT: " + userHeartCount(socket.id))
		console.log("TOTAL HEARTS: " + totalHeartCount())
		emitUserStats();
	});

	socket.on("direction", function(data) {
		viewerStats[socket.id]["direction"].unshift({
			"x": data.x,
			"y": data.y,
			"z": data.z
		})
		// console.log({
		// 	"x": data.x,
		// 	"y": data.y,
		// 	"z": data.z
		// })
		var avgActiveDirection = findAvgActiveDirection()

		katiedashboardio.emit('direction', avgActiveDirection)

	})

	socket.on("emojiVote", function(data){
		viewerStats[socket.id]["reaction"][data] += 1;
		katiedashboardio.emit("reaction", data)
		katiestreamio.emit("emojiVote", data)
	})

	socket.on('disconnect', function() {
		console.log('viewer disconnected');
		viewerStats[socket.id]["active"] = false;
		viewerStats[socket.id]["left"] = new Date();
		console.log("TOTAL VIEWERS: " + totalViewers());
		console.log("TOTAL ACTIVE VIEWERS: " + totalActiveViewers())
		emitUserStats();
		saveData();
	})
})

function saveData() {
	jsonfile.writeFile('./data/data.json', viewerStats, function(err) {
		if (err) {
			console.log("couldnt write to file: " + err)
		} else {
			console.log("Saved data to disk")
		}
	})
}

function emitUserStats() {
	katiedashboardio.emit('stats', {
		'totalViewers': totalViewers(),
		'activeViewers': totalActiveViewers(),
		'totalHearts': totalHeartCount()
	})
}

// io for chat page for katie to see incoming comments
katiechatio.on('connection', function(socket) {
	console.log("CHAT DASHBOARD IS ACTIVE")

})

// io for dashboard page for katie to see stats
katiedashboardio.on('connection', function(socket) {
	console.log("ANALYTICS DASHBOARD IS ACTIVE");

	socket.on('recipe', function(data) {
		katiestreamio.emit('recipe', data)
	})
})

var emailio = io.of('/email')

var emailList = {
	"emails": []
}

emailio.on('connection', function(socket) {
	console.log("homepage connected")

	socket.on('email', function(data) {
		emailList["emails"].push(data)
		saveEmailData();
	})
})

function saveEmailData() {
	jsonfile.writeFile('./data/emails.json', emailList, function(err) {
		if (err) {
			console.log("couldnt write to file: " + err)
		} else {
			console.log("Saved emails")
		}
	})
}


function findAvgUserDirection(id) {
	var x = 0;
	var y = 0;
	var z = 0;
	var array_length = viewerStats[id]["direction"].length;

	for (var i in viewerStats[id]["direction"]) {
		x += parseFloat(viewerStats[id]["direction"][i]["x"])
		y += parseFloat(viewerStats[id]["direction"][i]["y"])
		z += parseFloat(viewerStats[id]["direction"][i]["z"])
	}

	var avg_x = x / array_length;
	var avg_y = y / array_length;
	var avg_z = z / array_length;

	console.log(avg_x, avg_y, avg_z)

	var avg_user_direction = findFinalDirection(avg_x, avg_y, avg_z);
	return avg_user_direction;
}

function findAvgActiveDirection() {
	var x = 0;
	var y = 0;
	var z = 0;
	var number_of_active_viewers = totalActiveViewers()

	for (var i in viewerStats) {
		if (viewerStats[i]["active"] && !viewerStats[i]["admin"]) {
			x += parseFloat(viewerStats[i]["direction"][0]["x"])
			y += parseFloat(viewerStats[i]["direction"][0]["y"])
			z += parseFloat(viewerStats[i]["direction"][0]["z"])
		}
	}

	var avg_x = x / number_of_active_viewers;
	var avg_y = y / number_of_active_viewers;
	var avg_z = z / number_of_active_viewers;


	var avg_active_direction = findFinalDirection(avg_x, avg_y, avg_z);
	return avg_active_direction;
}

function findAvgTotalDirection() {
	var x = 0;
	var y = 0;
	var z = 0;
	var number_of_total_viewers = totalViewers()

	for (var i in viewerStats) {
		if (!viewerStats[i]["admin"]) {
			x += parseFloat(viewerStats[i]["direction"][0]["x"])
			y += parseFloat(viewerStats[i]["direction"][0]["y"])
			z += parseFloat(viewerStats[i]["direction"][0]["z"])
		}
	}

	var avg_x = x / number_of_total_viewers;
	var avg_y = y / number_of_total_viewers;
	var avg_z = z / number_of_total_viewers;

	console.log(avg_x, avg_y, avg_z)

	var avg_total_direction = findFinalDirection(avg_x, avg_y, avg_z);
	return avg_total_direction;
}

function findFinalDirection(x, y, z) {
	var x_dir = ""
	var y_dir = ""
	var z_dir = ""
	var final_direction = ""

	// find direction based on parsing values
	if (x > 0 && x <= 1) {
		x_dir = "Right"
	} else if (x < 0 && x >= -1) {
		x_dir = "Left"
	} else {
		x_dir = ""
	}

	if (y > 0 && y <= 1) {
		y_dir = "Up"
	} else if (y < 0 && y >= -1) {
		y_dir = "Down"
	} else {
		y_dir = ""
	}

	if (z > 0 && z <= 1) {
		z_dir = "Front"
	} else if (z < 0 && z >= -1) {
		z_dir = "Back"
	} else {
		z_dir = ""
	}

	final_direction = z_dir + " " + y_dir + " " + x_dir;
	return final_direction;
}



// find total number of viewers who ever logged into this stream
function totalViewers() {
	// subtract one so dashboard is not considered viewer
	//return Object.keys(viewerStats).length-1;
	var totalViewers = 0;

	for (var i in viewerStats) {
		if (!viewerStats[i]["admin"]) {
			totalViewers += 1
		}
	}

	return totalViewers;
}

function activeUserList() {
	var users = [];
	for (var i in viewerStats) {
		if (!viewerStats[i]["admin"]) {
			users.push(i)
		}
	}
	return users
}

// total viewers who are currently watching stream
function totalActiveViewers() {
	var activeViewers = 0;

	for (var i in viewerStats) {
		if (viewerStats[i]["active"] && !viewerStats[i]["admin"]) {
			activeViewers += 1;
		}
	}
	return activeViewers;
}

// viewers who joined but left
function totalViewersWhoLeft() {
	var inactiveViewers = 0;

	for (var i in viewerStats) {
		if (!viewerStats[i]["active"] && !viewerStats[i]["admin"]) {
			inactiveViewers += 1;
		}
	}
	return inactiveViewers;
}

// find heart count of individual viewer
function userHeartCount(id) {
	return viewerStats[id]["heartCount"];
}

// find total hearts across all viewers
function totalHeartCount() {
	var totalHearts = 0
	for (var i in viewerStats) {
		totalHearts += parseInt(viewerStats[i]["heartCount"]);
	}
	return totalHearts;
}

http.listen(80, function() {
	console.log("listening");
})