var express = require('express');
var router = express.Router();

router.get('/', function(req,res,next){
	res.render('katie/katie_stream.jade')
})

router.get('/chat', function(req,res,next){
	res.render("katie/katie_chat.jade")
})

router.get('/nimda', function(req,res,next){
	res.render("katie/katie_dashboard.jade")
})

router.get('/user-list', function(req,res,next){
	// do something
})

router.post('/user', function(req,res,next){
	var id = req.body.id;
	var heartCount = userHeartCount(id);
	var direction = findAvgUserDirection(id);
	var active = viewerStats[id]["active"]
	var duration = null;
	if(active) {
		//return duration in seconds
		duration = parseInt((new Date - viewerStats[id]["joined"])/1000);
	} else {
		duration = parseInt((viewerStats[id]["left"]-viewerStats[id]["joined"])/1000);
	}
	res.render('user_details.jade',{
		"heartCount":heartCount,
		"direction":direction,
		"active":active,
		"duration": duration
	})
})

module.exports = router;