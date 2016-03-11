$(document).ready(function(){
	//console.log("Stream");
	var socket_url = "http://128.122.6.128:3000"
	var socket = io(socket_url + "/katiestream")

	var form = $("#chat-form");
	var chatMessage = $("#chat-input-message");

	var chatWrapper = $("#chat-wrapper")
	var chatList = $("#chat-message-list")
	var chatWidget = $("#chat-widget")
	var toggleChat = $(".toggle-chat");

	var placeholder = $(".placeholder-text");

	var chatVisible = true;

	form.on('submit', function(event){
		event.preventDefault();

		var message = chatMessage.val();

		if(message){
			socket.emit('chatMessage', message)
		}

		chatMessage.val("");
	})

	// check if stream is live or not
	socket.emit('isActive','ask')

	socket.on('status', function(msg){
		if(msg == true){
			//change button to join
			$(".wait").hide();
			$(".join").show()
		}
	})

	socket.on('activate',function(msg){
		// activate join button for connected clients
		$(".wait").hide();
		$(".join").show();
	})

	socket.on('deactivate', function(msg){
		// throw up a message to say stream is over
		$("#welcome").show();
		$(".wait").show();
		$(".join").hide();
	})

	socket.on('chatMessage', function(msg){
		if(placeholder.is(":visible")){
			placeholder.hide();
		}

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

	if (!Modernizr.webgl) {
	     alert("Your Browser does not support WebGL, therefore this stream won't run. Try on a different computer, or sign up to get exclusive access to our mobile app beta upon release: www.svrround.com");
	}

	$("#join").on("click", function(){
		//console.log("remove jumbotron");
		$("#welcome").hide();
	})

	//check if HLS is supported
  if(Hls.isSupported()) {
  	video = document.createElement('video');
  	//console.log("HLS is supported [hls.js] + Video element created " + video)
  	generateVideo(video);
 }


// ---------- Video Initialisation ---------
function generateVideo(){
	//console.log('[1]generate video- video loaded');
	video = document.createElement('video');

		//HLS code ---- svrd server http://wowzaprodhd14-lh.akamaihd.net/i/58762d9c_1@384091/master.m3u8
	var hls = new Hls();
    hls.loadSource('http://wowzaprodhd25-lh.akamaihd.net/i/9e329736_1@364238/master.m3u8');
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED,function() {
    	//console.log('[HLS] Video playing and generating graphics')
    	video.play();
 		generateGraphics(video);

	});
}



	var texture, material, mesh, controls, camera, dae, loader, mesh, renderer;

	function generateGraphics(video){
		//console.log('[2]generate graphics');		

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
		camera = new THREE.PerspectiveCamera( 250, aspect );

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
				//console.log('hello video texture');
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

		loader.options.centerGeometry = true;
		loader.load( './obj/finalRicoh.dae', function ( collada ) {

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

			//console.log(collada)
			// console.log(collada.dae.geometries['Sphere-mesh'])
			// collada.dae.geometries['Sphere-mesh'].doubleSided = true;

	});

		window.addEventListener("resize", onWindowResize, false);

		function onWindowResize(){
			renderer.setSize(window.innerWidth, window.innerHeight);
		}


	//--------- Load Collada Model: YUM --------
		var YUMMY;
		loaderYUM = new THREE.ColladaLoader();
			loaderYUM.options.convertUpAxis = true;
			loaderYUM.options.centerGeometry = true;
			loaderYUM.load( './obj/yum.dae', function ( colladaYUM ) {
				//need to set dae as the collada scene and use that in traverse
				daeYUM = colladaYUM.scene;
				daeYUM.traverse( function ( child2 ) {

		        if ( child2 instanceof THREE.Mesh ) {
		        	//need to add the mesh child we just created rather than the actual dae object loaded
		            // child.material = materialYUM;
		            YUMMY = child2;
		        }

		    } );
		});

		var x, y, z, w, vector;

	//----------- ANIMATE -------------
	function animate() {
		texture.needsUpdate = true;
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
		controls.update();
		camera.updateProjectionMatrix();
			
		var vectorL = new THREE.Vector3( 0, 0, - 1 );
		vectorL.applyQuaternion( camera.quaternion );

		x = vectorL.x;
		y = vectorL.y;
		z = vectorL.z;

		TWEEN.update();
	}

	requestAnimationFrame( animate );

	//------------ DOUBLE CLICK ---------------
		$( document ).dblclick(function(event) {
			event.preventDefault();
			socket.emit('heartCount','one')
			socket.emit('direction', {"x":x,"y":y,"z":z})

			YUMMY.position.set(x*2,y*2,z*2);
			YUMMY.lookAt(camera.position);
			var sizze = 0.08;
			YUMMY.scale.set(-sizze,-sizze,sizze);

			scene.add(YUMMY);
			new TWEEN.Tween(YUMMY.scale).to( {x:-0.12,y:-0.12,z:0.12}, 2000).easing( TWEEN.Easing.Elastic.Out).start();

			// cube2.position.set(x,y,z);
			// scene.add( cube2 );

			var myVar = setTimeout(end, 730);
		});

		function end(){
			scene.remove( cube2 );
			scene.remove(YUMMY);
		};

	}

})



