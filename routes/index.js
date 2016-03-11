var express = require('express');
var router = express.Router();

router.get('/', function(req,res,next){
	res.render("index.jade")
})

router.get('/activate', function(req,res,next){
	res.render("activate.jade")
})


module.exports = router;