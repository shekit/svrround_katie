$(document).ready(function(){
	console.log("Stream");
	var socket_url = "http://localhost:3000"
	var socket = io(socket_url + "/katiestream")

	var form = $("#chat-form");
	var chatMessage = $("#chat-input-message");

	var chatWrapper = $("#chat-wrapper")
	var chatList = $("#chat-message-list")
	var chatWidget = $("#chat-widget")
	var toggleChat = $(".toggle-chat");

	var chatVisible = true;

	form.on('submit', function(event){
		event.preventDefault();

		var message = chatMessage.val();

		if(message){
			socket.emit('chatMessage', message)
		}

		chatMessage.val("");
	})

	socket.on('chatMessage', function(msg){
		if(msg){
			var li = "<li>" + msg + "</li>"
			chatList.prepend(li);
		}
	})

	socket.on('recipe', function(msg){
		console.log("got recipe")
	})

	$("body").on('click', '.toggle-chat', function(event){
		event.preventDefault();

		if(chatVisible){
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

	$("body").on('click', '#info', function(event){
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

    var video;
	var sphereQuality = 400;

	//check if HLS is supported
  if(Hls.isSupported()) {
  	video = document.createElement('video');
  	console.log("HLS is supported [hls.js] + Video element created " + video)
  	generateVideo(video);
 }


// ---------- Video Initialisation ---------
function generateVideo(){
	console.log('[1]generate video- video loaded');
	video = document.createElement('video');

		//HLS code ---- svrd server http://wowzaprodhd14-lh.akamaihd.net/i/58762d9c_1@384091/master.m3u8
	var hls = new Hls();
    hls.loadSource('http://wowzaprodhd25-lh.akamaihd.net/i/9e329736_1@364238/master.m3u8');
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED,function() {
    	console.log('[HLS] Video playing and generating graphics')
    	video.play();
 		generateGraphics(video);

	});
}



	var texture, material, mesh, controls, camera, dae, loader, mesh, renderer;

	function generateGraphics(video){
		console.log('[2]generate graphics');		

		//define the scene ---- alpha: true to add transparency with html and css
		renderer = new THREE.WebGLRenderer({antialias: true, alpha: true});

		//set renderer to size of window and attach to window
		renderer.setSize(document.body.clientWidth, document.body.clientHeight);
		$("#container").append(renderer.domElement);

		var scene = new THREE.Scene();

		//set the width and height of the renderer to the window
		var width = renderer.domElement.width;
		var height = renderer.domElement.height;
		var aspect = width / height;

		//camera (fov/zoom, aspect)
		camera = new THREE.PerspectiveCamera( 265, aspect );

		//this number into the center of the sphere - half of radius of sphere, aka 80 / 2
		camera.position.x = 0;
		camera.position.y = 0;
		camera.position.z = 10;

		//Mouse motion controls
		controls = new THREE.OrbitControls( camera, renderer.domElement );
		controls.enableZoom = false;
		controls.enableKeys = true;
		controls.enableDamping = true;

		// a simple ambient light to color the image
		ambientLight = new THREE.AmbientLight( 0xffffff );
		scene.add( ambientLight );

				//video texture from video hls feed
				console.log('hello video texture');
				texture = new THREE.VideoTexture( video );
				//round texture to nearest sholw number
				texture.minFilter = THREE.NearestFilter;

		//create double-sided material from video texture
		var material = new THREE.MeshBasicMaterial( {
			map: texture, 
			side: THREE.DoubleSide
			} );

	//--------- Load Collada Model --------
	loader = new THREE.ColladaLoader();
		loader.options.convertUpAxis = true;
		loader.options.centerGeometry = true;
		loader.load( './obj/latestRicoh.dae', function ( collada ) {

			//need to set dae as the collada scene and use that in traverse
			dae = collada.scene;

			dae.traverse( function ( child ) {

	        if ( child instanceof THREE.Mesh ) {

	        	//need to add the mesh child we just created rather than the actual dae object loaded
	            child.material = material;
				scene.add(child);

				//DAE variables
				// dae.scale.set(600,600,600); 
				// dae.position.y = 500;
				// dae.rotate.z = 180;

	        }

	    } );

			console.log(collada)
			// console.log(collada.dae.geometries['Sphere-mesh'])
			// collada.dae.geometries['Sphere-mesh'].doubleSided = true;

	});

		window.addEventListener("resize", onWindowResize, false);

		function onWindowResize(){
			renderer.setSize(window.innerWidth, window.innerHeight);
		}


	//-------- YUM 3D cube part ----------------
		var geometry = new THREE.BoxGeometry( 3, 1, 1 );
		var texture2 = new THREE.TextureLoader().load( "./images/yum.png" );
		// var material2 = new THREE.MeshBasicMaterial( THREE.ImageUtils.loadTexture('yum.png') );
		var cube = new THREE.Mesh( geometry, texture2 );

		var x, y, z, w, vector;

	//----------- ANIMATE -------------
		function animate() {
			texture.needsUpdate = true;
			requestAnimationFrame( animate );
			renderer.render( scene, camera );
			controls.update();
				
			x = camera.quaternion.x;
			y = camera.quaternion.y;
			z = camera.quaternion.z;
			w = camera.quaternion.w;
			//send camera direction variables on every frame 

			//console.log(x + "x    " + y  + "y    " + z  + "z    " + w  + "w    " )
		}

	//------------ DOUBLE CLICK ---------------
		$( document ).dblclick(function(event) {
			//event.preventDefault();
			socket.emit('heartCount','one')
			console.log("cube")
			//send x,y,z when "liked" for a direction
			cube.position.set(x,y,z);
			scene.add(cube);
			var myVar = setTimeout(end, 3000);
	  		// canvas.drawImage( yum, x, y, z );
		});

		function end(){
			scene.remove(cube);
		};

		requestAnimationFrame( animate );

	}

})



