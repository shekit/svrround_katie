$(document).ready(function() {

	window.latestEmoji = 'images/grinning.png';


	$('[data-toggle="popover"]').popover({
		html: true
	});

	$('#chat-input-message').emojiPicker({
		height: '300px',
		width: '450px',
		iconBackgroundColor: 'white'
	});
	// $('body').mousedown(function() {
	// 	$(this).css('cursor', 'move');
	// });
	// $('body').mouseup(function() {
	// 	$(this).css('cursor', 'pointer');
	// });

	//$('#welcome').hide()
		//console.log("Stream");

	var socket_url = "http://159.203.91.98:3000"
	var socket = io(socket_url + "/katiestream")

	var form = $("#chat-form");
	var inviteForm = $("#invite-form")
	var chatMessage = $("#chat-input-message");

	var chatWrapper = $("#chat-wrapper")
	var chatList = $("#chat-message-list")
	var chatWidget = $("#chat-widget")
	var toggleChat = $(".toggle-chat");

	var placeholder = $(".placeholder-text");

	var chatVisible = true;

	form.on('submit', function(event) {
		event.preventDefault();
		$('.emojiPicker').hide();

		var message = chatMessage.val();

		if (message) {
			socket.emit('chatMessage', message)
		}

		chatMessage.val("");
	})

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

	socket.on('chatMessage', function(msg) {
		if (placeholder.is(":visible")) {
			placeholder.hide();
		}

		if (msg) {
			var li = "<li>" + msg + "</li>"
			chatList.prepend(li);
		}
	})

	socket.on('recipe', function(msg) {
		console.log("got recipe")
	})

	$("body").on('click', '.toggle-chat', function(event) {
		event.preventDefault();

		if (chatVisible) {
			chatWidget.hide();
			toggleChat.find('span').removeClass('glyphicon-remove')
			toggleChat.find('span').addClass('glyphicon-comment')
			chatVisible = false;
			chatWrapper.removeClass('shadow')
		} else {
			chatVisible = true;
			chatWidget.show();
			toggleChat.find('span').removeClass('glyphicon-comment');
			toggleChat.find('span').addClass('glyphicon-remove')
			chatWrapper.addClass('shadow')
		}
	})

	$("body").on('click', '#info', function(event) {
		event.preventDefault();
		$("#info").hide();
	})

	// get ip address
	$.getJSON("https://api.ipify.org?format=jsonp&callback=?",
		function(json) {
			console.log("My public IP address is: ", json.ip);
			socket.emit("ip", json.ip)
		}
	);


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

		// 	//HLS code ---- svrd server 
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

		// switch(data.details) {
		//   case hls.ErrorDetails.FRAG_LOAD_ERROR:
		//     // ....
		//     break;
		//   default:
		//     break;
		// }

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
					scene.add(child);

					//Play the Video Stream
					video.play();

					//DAE variables
					// dae.scale.set(1000,1000,1000); 
					// dae.position.y = 500;
					// dae.rotate.z = 180;

				}

			});

			console.log(collada)
				// console.log(collada.dae.geometries['Sphere-mesh'])
				// collada.dae.geometries['Sphere-mesh'].doubleSided = true;

		});

		//--------- Load Collada Model: YUM --------
		var YUMMY;
		loaderYUM = new THREE.ColladaLoader();
		loaderYUM.options.convertUpAxis = true;
		loaderYUM.options.centerGeometry = true;
		loaderYUM.load('./obj/heart.dae', function(colladaYUM) {
			//need to set dae as the collada scene and use that in traverse
			daeYUM = colladaYUM.scene;
			daeYUM.traverse(function(child2) {

				if (child2 instanceof THREE.Mesh) {
					//need to add the mesh child we just created rather than the actual dae object loaded
					// child.material = materialYUM;
					YUMMY = child2;
				}

			});
		});

		//---------------------------------

		window.addEventListener("resize", onWindowResize, false);

		function onWindowResize() {
			renderer.setSize(window.innerWidth, window.innerHeight);
		}

		var geometry2 = new THREE.BoxGeometry(4, 4, 4);
		var material2 = new THREE.MeshBasicMaterial({
			color: 0x00ff00
		});
		var cube2 = new THREE.Mesh(geometry2, material2);



		//-------- YUM 3D cube part ----------------
		// var geometry = new THREE.BoxGeometry( 3, 1, 1 );
		// var texture2 = new THREE.TextureLoader().load( "yum.png" );
		// // var material2 = new THREE.MeshBasicMaterial( THREE.ImageUtils.loadTexture('yum.png') );
		// var cube = new THREE.Mesh( geometry, texture2 );

		var x, y, z, w, vector, cube;

		//----------- ANIMATE -------------
		function animate() {
			texture.needsUpdate = true;
			requestAnimationFrame(animate);
			renderer.render(scene, camera);
			controls.update();
			camera.updateProjectionMatrix();

			vectorL = new THREE.Vector3(0, 0, -1);
			vectorL.applyQuaternion(camera.quaternion);

			x = vectorL.x;
			y = vectorL.y;
			z = vectorL.z;

			//console.log(vectorL);
			//
			
			mX = camera.quaternion._x
			mY = camera.quaternion._y
			mZ = camera.quaternion._z

			// {_yx: 4.3297783052200656e-17, _y: 0.7071071347398489, _z: -0.7071064276334229, _w: 4.3297826349983774e-17}
			// 
			
			// -0.011464996347162866 0.7070141842464389 -0.7070134772329736
			if (mY > 0.4 && mY < .9 && mZ > -1 && mZ < -.3){
				showBanner = true;
			}
		// x 5.556450087193521e-8    y 1.000000004536884    z 9.984546019620785e-7

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
			YUMMY.rotateOnAxis('y',90)
			YUMMY.lookAt(camera.position);
			var sizze = 0.08;
			YUMMY.scale.set(-sizze, -sizze, sizze);

			scene.add(YUMMY);
			new TWEEN.Tween(YUMMY.scale).to({
				x: -0.12,
				y: -0.12,
				z: 0.12
			}, 2000).easing(TWEEN.Easing.Elastic.Out).start();

			var myVar = setTimeout(end, 730);
			//canvas.drawImage(yum, x, y, z);

		}

		$(document).dblclick(function() {

			//fireEmoji();
			fireLike();

		});


	}

})



//------ Emoji Dashboard ---- //

var emojiDash;
var emojis = {};

function windowResized() {
	if (emojiDash) emojiDash.center().position(AUTO, windowHeight - emojiDash.size().height);
}

function setup() {

	noCanvas();
	//buildEmojiDash();

}


function buildEmojiDash() {

	emojiDash = createDiv('').id('emoji-box').size(300, 100).center();
	emojiDash.position(AUTO, windowHeight - emojiDash.size().height);

	emojis.grinning = createImg('images/grinning.png', prepareEmoji);
	emojis.crying = createImg('images/crying.png', prepareEmoji);
	emojis.hearteyes = createImg('images/hearteyes.png', prepareEmoji);
	emojis.astonished = createImg('images/astonished.png', prepareEmoji);

}


function prepareEmoji() {

	var self = this;

	this.popularity = .5;
	this.w = this.size().width;
	this.h = this.size().height;

	this.timer = setInterval(function() {
		if (self.popularity > .5) self.popularity -= .005;
		self.size(self.w * self.popularity, self.h * self.popularity).center();
	}, 250)

	this.addClass('emoji-icon');
	this.parent(createDiv('').addClass('emoji-icon-con').parent(emojiDash)).size(this.w * this.popularity, this.h * this.popularity).center()
		.mouseOver(function() {
			this.style('cursor:pointer')
		})
		.mousePressed(function() {
			console.log('SRC', this.elt.src)
			window.latestEmoji = this.elt.src;
			if (this.popularity < 1) this.popularity += .02;
			this.size(this.w * this.popularity, this.h * this.popularity).center();
		});
}

function fireEmoji() {
	var emojiBg = createImg(window.latestEmoji)

	emojiBg.position(random(150, windowWidth - 200), windowHeight - random(100, 400))
	emojiBg.addClass('animated-fast rubberBand')

	emojiBg.elt.addEventListener('animationend', function() {
		emojiBg.remove();
	}, true);

}