$(document).ready(function() {

	$('[data-toggle="popover"]').popover({
		html: true
	});

		$('#chat-input-message').emojiPicker({
		height: '280px',
		width: '400px',
		iconBackgroundColor: 'transparent'
	});


	$.ajax({
		url: 'https://randomuser.me/api/',
		dataType: 'json',
		success: function(data) {

			window.user = {};
			user.name = data.results[0].login.username;

			//pick random color for username

			user.color = {};
			user.color.r = Math.floor(Math.random() * 150 + 105);
			user.color.g = Math.floor(Math.random() * 150 + 105);
			user.color.b = Math.floor(Math.random() * 150 + 105);

			// get user ip address

			$.getJSON('https://api.ipify.org?format=jsonp&callback=?',
				function(data) {
					user.ip = data.ip;
					socket.emit('ip', data.ip);
				}
			);

		}
	});


	$('#container, #chat-widget').mousedown(function() {
		if ($('.popover').is(":visible")) $('.popover').hide();
		if ($('.emojiPicker').is(":visible")) $('.emojiPicker').hide();

	});

	$('#container').on('mousedown', function() {
		if (features.banner.visible && mouseIsCenter()) window.open('https://soundcloud.com/sssshawnnnn/', '_blank')
	});

	$('#container').on('mousemove', function() {
		// if (mouseIsCenter() && features.banner.visible) $('#container').css('cursor','pointer')
		// else $('#container').css('cursor','grab')
	});

	function mouseIsCenter() {
		return mouseX < windowWidth / 2 + 100 && mouseX > windowWidth / 2 - 100 && mouseY < windowHeight / 2 + 100 && mouseY > windowHeight / 2 - 100
	}

	console.log("Stream");

	//var socket_url = "http://45.55.213.136:80"
	var socket_url = "http://localhost:3000"
	window.socket = io(socket_url + "/katiestream")

	var chatForm = $("#chat-form");
	var inviteForm = $("#invite-form")
	var chatMessage = $("#chat-input-message");

	var chatWrapper = $("#chat-wrapper")
	var chatList = $("#chat-message-list")
	var chatWidget = $("#chat-widget")
	var toggleChat = $(".toggle-chat");

	var placeholder = $(".placeholder-text");

	var chatVisible = true;

	chatForm.on('submit', function(event) {

		event.preventDefault();

		var message = chatMessage.val();

		//send message to server for broadcast

		if (message) socket.emit('chatMessage', {
			user: user,
			message: message
		});

		chatMessage.val('');
		$('.emojiPicker').hide();

	});

	$(document).on('submit', "#invite-form", function(e) {
		e.preventDefault();

		socket.emit('tweet', {
			fromUser: $('#from-user').val(),
			toUser: $('#to-user').val()
		})

		console.log('INVITE FORM submitted')
		$('.popover').hide();

	});


	// check if stream is live or not
	socket.emit('isActive', 'ask')

	socket.on('status', function(msg) {
		if (msg == true) {
			//change button to join
			$(".wait").hide();
			$(".join").show()
		}
	})

	//listen for audience reactions
	socket.on('emojiVote', function(data) {
		features.emojiDash.resizeEmoji(data)
	})

	socket.on('activate', function(msg) {
		// activate join button for connected clients
		$(".wait").hide();
		$(".join").show();
	})

	socket.on('deactivate', function(msg) {
		// throw up a message to say stream is over
		$("#welcome").show();
		$(".wait").show();
		$(".join").hide();
	})

	
	socket.on('chatMessage', function(data) {

		//if initial placeholder text in chat is still there remove it

		if (placeholder.is(':visible')) placeholder.hide();

		if (data.message) {

			//create name node

			var nameContainer = document.createElement('div');
			nameContainer = $(nameContainer);
			nameContainer.html(data.user.name + ' ');
			nameContainer.css('color', 'rgb(' + data.user.color.r + ',' + data.user.color.g + ',' + data.user.color.b + ')');

			//if message is big enough put username on new line

			var msgColVal = 'col-md-12 col-sm-12 col-lg-12 col-xs-12';
			var nameColVal = 'col-md-12';

			if (data.message.length < 25) {
				msgColVal = 'col-md-7 col-sm-7 col-lg-7 col-xs-7';
				nameColVal = 'col-md-5 col-sm-5 col-lg-5 col-xs-5';
			}

			$(nameContainer).addClass(nameColVal);

			//create msg node, add name to it, prepend to chat

			var msgContainer = document.createElement('li');
			msgContainer = $(msgContainer);
			msgContainer.addClass('container');
			msgContainer.html('<div style="text-align:left; font-size:13px" class="' + msgColVal + '" >' + data.message + '</div>');
			msgContainer.append(nameContainer);
			chatList.prepend(msgContainer);

		}
	});


	socket.on('recipe', function(msg) {
		console.log("got recipe")
	})

	$('body').on('click', '.toggle-chat', function(event) {
		event.preventDefault();

		chatIcon = $('#chat-icon');

		if (chatVisible) {
			chatWidget.hide();
			chatIcon.attr('src', '/images/ui_openChat.svg');
			chatVisible = false;
		} else {
			chatVisible = true;
			chatWidget.show();
			chatIcon.attr('src', '/images/ui_closeChat.svg');
		}
	});

	$("body").on('click', '#info', function(event) {
		event.preventDefault();
		$("#info").hide();
	})


	// ------------COMPATABILITY CHECK ------------------
	if (Modernizr.video) {
		console.log("video supported");
	} else {
		// not-supported
	}

	if (Modernizr.webgl) {
		console.log("webgl supported");
	} else {
		alert("Your Browser does not support WebGL, therefore this stream won't run. Try on a different computer, or sign up to get exclusive access to our mobile app beta upon release: www.svrround.com");
	}

	if (Modernizr.xhrresponsetypeblob) {
		console.log("xhr blob supported");
	} else {
		// not-supported
	}

	if (Modernizr.bloburls) {
		console.log("blobs supported");
	} else {
		// not-supported
	}

	if (Modernizr.canvas) {
		console.log("canvas supported");
	} else {
		// not-supported
	}


	$("#join").on("click", function() {
		console.log("remove jumbotron");
		$("#welcome").remove();
	})

	console.log('beginning of script');

	// $( document ).ready(generateVideo);

	// check if HLS is supported
	if (Hls.isSupported()) {
		// video = document.createElement('video');
		console.log("HLS is supported [hls.js] + Video element created " + video)
		generateVideo(video);
	}

	// ---------- Video Initialisation ---------
	var hls = new Hls();
	var video;

	function generateVideo() {
		console.log('[1]generate video- video loaded');
		video = document.createElement('video');

		// 	HLS code -
		// 	demo --- http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8
		// 	svrd server http://wowzaprodhd14-lh.akamaihd.net/i/58762d9c_1@384091/master.m3u8
		var hls = new Hls();
		hls.loadSource('http://qthttp.apple.com.edgesuite.net/1010qwoeiuryfg/sl.m3u8');
		hls.attachMedia(video);
		hls.on(Hls.Events.MANIFEST_PARSED, function() {
			console.log('[HLS] Video playing and generating graphics')
				// video.play();
			generateGraphics(video);


		});

	}

	// ---------- HLS Callbacks ---------
	hls.on(Hls.Events.ERROR, function(event, data) {

		var errorType = data.type;
		var errorDetails = data.details;
		var errorFatal = data.fatal;

		if (data.fatal) {
			switch (data.type) {

				case Hls.ErrorTypes.NETWORK_ERROR:
					// try to recover network error
					console.log("[HLS] fatal network error encountered, try to recover");
					hls.startLoad();
					break;

				case Hls.ErrorTypes.MEDIA_ERROR:
					console.log("[HLS] fatal media error encountered, try to recover");
					hls.swapAudioCodec();
					hls.recoverMediaError();
					break;

				default:
					// cannot recover
					hls.destroy();
					alert("Please Reload, your browser encountered an error");
					break;
			}
		}

	});



	// ---------- GRAPHICS ---------

	var texture, material, mesh, controls, camera, dae, loader, mesh, renderer;

	function generateGraphics(video) {

		console.log('[2]generate graphics');

		//define the scene ---- alpha: true to add transparency with html and css
		renderer = new THREE.WebGLRenderer({
			antialias: true,
			alpha: true
		});

		//set renderer to size of window and attach to window
		renderer.setSize(document.body.clientWidth, document.body.clientHeight);
		$("#container").append(renderer.domElement);

		var scene = new THREE.Scene();

		//set the width and height of the renderer to the window
		var width = renderer.domElement.width;
		var height = renderer.domElement.height;
		var aspect = width / height;

		//camera (fov/zoom, aspect)
		camera = new THREE.PerspectiveCamera(265, aspect);

		//this number into the center of the sphere - half of radius of sphere, aka 80 / 2
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = -10;

		//Mouse motion controls
		controls = new THREE.OrbitControls(camera, renderer.domElement);
		controls.enableZoom = false;
		controls.enableKeys = false;
		controls.enableDamping = true;

		// a simple ambient light to color the image
		ambientLight = new THREE.AmbientLight(0xffffff);
		scene.add(ambientLight);

		//video texture from video hls feed
		console.log('hello video texture');
		texture = new THREE.VideoTexture(video);
		//round texture to nearest sholw number
		texture.minFilter = THREE.NearestFilter;

		//create double-sided material from video texture
		var material = new THREE.MeshBasicMaterial({
			map: texture,
			side: THREE.DoubleSide
		});

		//--------- Load Collada Model: Ricoh Model --------
		loader = new THREE.ColladaLoader();
		// loader.options.convertUpAxis = true;
		loader.options.centerGeometry = true;
		loader.load('./obj/ricohmorphedUV.dae', function(collada) {

			//need to set dae as the collada scene and use that in traverse
			dae = collada.scene;

			dae.traverse(function(child) {

				if (child instanceof THREE.Mesh) {

					//need to add the mesh child we just created rather than the actual dae object loaded
					child.material = material;
					child.rotation.x = Math.PI*(0.52);
					child.rotation.y = Math.PI*(-0.3);
					scene.add(child);

					//Play the Video Stream
					video.play();


				}

			});

		});

		//--------- Load Collada Model: YUM --------
		var YUMMY;
		var materialYUM = new THREE.MeshPhongMaterial({
			color: 0xff4444
		});
		loaderYUM = new THREE.ColladaLoader();
		// loaderYUM.options.convertUpAxis = true;
		// loaderYUM.options.centerGeometry = true;
		loaderYUM.load('./obj/heart.dae', function(colladaYUM) {
			//need to set dae as the collada scene and use that in traverse
			daeYUM = colladaYUM.scene;
			daeYUM.traverse(function(child2) {

				if (child2 instanceof THREE.Mesh) {
					//need to add the mesh child we just created rather than the actual dae object loaded
					child2.material = materialYUM;
					YUMMY = child2;
				}

			});
		});

		//---------------------------------

		var geometry2 = new THREE.BoxGeometry(4, 4, 4);
		var material2 = new THREE.MeshBasicMaterial({
			color: 0x00ff00
		});
		var cube2 = new THREE.Mesh(geometry2, material2);


		//--- Banner when user looks down
		function addBanner() {

			var geometry = new THREE.BoxGeometry(4, 4, 4);

			var material = new THREE.MeshPhongMaterial({
				map: THREE.ImageUtils.loadTexture('images/sc.png'),
				overdraw: 0.5
			});

			features.banner = new THREE.Mesh(geometry, material);
			scene.add(features.banner);
			features.banner.visible = false;

		}

		addBanner();


		//----------- ANIMATE -------------
		

		var x, y, z, w, vector, cube;

		function animate() {

			mX = camera.quaternion._x
			mY = camera.quaternion._y
			mZ = camera.quaternion._z

			vectorL = new THREE.Vector3(0, 0, -1);
			vectorL.applyQuaternion(camera.quaternion);

			x = vectorL.x.toFixed(2);
			y = vectorL.y.toFixed(2);
			z = vectorL.z.toFixed(2);

			pos = {x : x, y:y,z:z}


			if (y > .95) {

				features.banner.visible = true;

			} else {

				features.banner.visible = false;
			}

			texture.needsUpdate = true;
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
			controls.update();
			camera.updateProjectionMatrix();

			TWEEN.update();

		}

		requestAnimationFrame(animate);

		//------------ DOUBLE CLICK TO LIKE ---------------


		function end() {
			console.log('cube destroyed');
			scene.remove(cube2);
			scene.remove(YUMMY);
		};

		function fireLike() {

			console.log("draw yum at " + x + "  " + y + "   " + z);

			YUMMY.position.set(x * 2, y * 2, z * 2);
			YUMMY.lookAt(camera.position);
			YUMMY.rotation.y = 90;
			var sizze = 0.08;
			YUMMY.scale.set(-sizze, -sizze, sizze);

			scene.add(YUMMY);
			new TWEEN.Tween(YUMMY.scale).to({
				x: -0.12,
				y: -0.12,
				z: 0.12
			}, 2000).easing(TWEEN.Easing.Elastic.Out).start();

			var myVar = setTimeout(end, 730);

			socket.emit("heartCount","yes")
			socket.emit("direction", {"x":x, "y":y, "z":z})

		}

		$('#container').dblclick(function() {

			fireLike();

		});


	}

		window.addEventListener("resize", onWindowResize, false);

		function onWindowResize() {
			console.log('resize')
			if (renderer) renderer.setSize(window.innerWidth, window.innerHeight);
			if (features.emojiDash) features.emojiDash.emojiContainer.center().position(AUTO, window.innerHeight - features.emojiDash.emojiContainer.size().height);
		}

});

//------ FEATURES ---- //
features = {};

function setup() {

	//declare features here
	//TODO listen to feature-set from dashboard via sockets

	features.emojiDash = new emojiDash();

}

function emojiDash() {

	this.emojis = {};
	this.latestEmoji = 'images/grinning.png';
	this.emojiContainer = null;
	this.build();
	this.addListeners();

}

emojiDash.prototype.build = function() {

	var parent = this;

	this.prepareEmoji = function() {

		var self = this;

		this.popularity = .5;
		this.w = this.size().width;
		this.h = this.size().height;

		this.timer = setInterval(function() {
			if (self.popularity > .5) self.popularity -= .005;
			self.size(self.w * self.popularity, self.h * self.popularity).center();
		}, 250)

		this.addClass('emoji-icon');
		this.parent(createDiv('').addClass('emoji-icon-con').parent(parent.emojiContainer)).size(this.w * this.popularity, this.h * this.popularity).center()
			.mouseOver(function() {
				this.style('cursor:pointer')
			})
			.mousePressed(parent.emojiVote);
	}

	this.emojiVote = function() {

		parent.latestEmoji = this.elt.src;
		parent.latestEmojiType = this.type;
		console.log(parent.latestEmojiType);

		socket.emit('emojiVote', parent.latestEmojiType);
		parent.fireEmoji();

	}

	var self = this;

	this.emojiContainer = createDiv('').id('emoji-box').size(300, 100).center();
	this.emojiContainer.position(AUTO, windowHeight - self.emojiContainer.size().height);

	this.emojis.grinning = createImg('images/grinning.png', self.prepareEmoji);
	this.emojis.grinning.type = 'grinning';
	this.emojis.crying = createImg('images/crying.png', self.prepareEmoji);
	this.emojis.crying.type = 'crying';
	this.emojis.hearteyes = createImg('images/hearteyes.png', self.prepareEmoji);
	this.emojis.hearteyes.type = 'hearteyes';
	this.emojis.astonished = createImg('images/astonished.png', self.prepareEmoji);
	this.emojis.astonished.type = 'astonished';


	this.resizeEmoji = function(whichEmoji) {

		var emoji = parent.emojis[whichEmoji]

		if (emoji.popularity < 1) emoji.popularity += .02;
		emoji.size(emoji.w * emoji.popularity, emoji.h * emoji.popularity).center();
	}

}


emojiDash.prototype.fireEmoji = function() {

	var self = this;

	var emojiBg = createImg(self.latestEmoji)

	emojiBg.position(random(0, windowWidth - 200), random(0, windowHeight - 200))
	emojiBg.addClass('animated-fast rubberBand')

	emojiBg.elt.addEventListener('animationend', function() {
		emojiBg.remove();
	}, true);

}

emojiDash.prototype.addListeners = function() {
	function windowResized() {
		if (features.emojiDash) features.emojiDash.emojiContainer.center().position(AUTO, windowHeight - features.emojiDash.emojiContainer.size().height);
	}
}