// render

define(['jquery', 'underscore'], function($, _){
	
	/**************
		Private
	**************/

	var spacetime 	= undefined;
	var canvas 		= undefined;
	var ctx 		= undefined;
	var renderLoop  = undefined; 
	var fps			= 60;
	var mouse 		= {visible: false};
	var objectZoom 	= 30; // Object size multiplier
	var camera 		= {
		x:0,
		y:0,
		cameraZoom: 1
	};

	var clearCanvas = function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
	}

	var moveCamera = function(e){
		switch(String.fromCharCode(e.charCode)){
			case 'w':
				camera.y += 10;
				break;
			case 'a':
				camera.x += 10;
				break;
			case 's':
				camera.y -= 10;
				break;
			case 'd':
				camera.x -= 10;
				break;
		}
	}

	var renderObject = function(object){
		// Formula for radius from volume
		var radius = Math.pow(3*(object.mass*object.density*objectZoom/4*Math.PI), (1/3));

		ctx.beginPath();
		ctx.arc(object.x + camera.x, object.y + camera.y, radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = '#AAA';
		if (object.cameraFocus === true) {
			ctx.fillStyle = '#C88';
		};
		ctx.fill();
		if (object.cameraFocus === true) {
			ctx.arc(object.x + camera.x, object.y + camera.y, radius + 3, 0, 2 * Math.PI, false);
			ctx.lineWidth = 2;
			ctx.strokeStyle = '#C88';
			ctx.stroke();
		};
	}

	var centerCamera = function(){
		var l_spacetime = spacetime.getSpace();
		for (var i = l_spacetime.length - 1; i >= 0; i--) {
			var object = l_spacetime[i]
			if (object.cameraFocus == true) {
				camera.x = -object.x + canvas.width/2;
				camera.y = -object.y + canvas.height/2;
			};
		};
	}

	var renderMouse = function(){
		if (mouse.visible === true) {

			ctx.fillStyle = '#AAA';
			switch (mouse.state){
				case 'placement':
					ctx.beginPath();
					ctx.arc(mouse.x, mouse.y, mouse.radius, 0, 2 * Math.PI, false);
					ctx.fill();
				
				break;
				case 'mass':

					ctx.beginPath();
					ctx.arc(mouse.x2, mouse.y2, mouse.radius, 0, 2 * Math.PI, false);
					ctx.fill();
				
				break;
				case 'velocity':
					// Draw a line between x,y and x2,y2
					ctx.beginPath();
					ctx.arc(mouse.x2, mouse.y2, mouse.radius, 0, 2 * Math.PI, false);
					ctx.fill();

					ctx.beginPath();
					ctx.moveTo(mouse.x, mouse.y);
					ctx.lineTo(mouse.x2, mouse.y2);
					ctx.strokeStyle = '#D55';
					ctx.lineWidth = 2;
					ctx.stroke();
				break;
			};
		}
	}

	/*************
		Public
	*************/

	var renderApi = {};

	renderApi.initialize = function(p_canvas, p_spacetime){
		canvas = p_canvas;
		ctx = canvas.getContext('2d');
		spacetime = p_spacetime;

		// WASD camera movement
		document.addEventListener('keypress', moveCamera);
	}

	renderApi.startLoop = function(){
		var self = this;

		renderLoop = setInterval(function(){
			self.renderFrame(spacetime.getSpace());
		}, 1000/fps);
	}

	renderApi.renderFrame = function(spacetime){
		clearCanvas();

		centerCamera();
		for (var i = spacetime.length - 1; i >= 0; i--) {
			renderObject(spacetime[i]);
		};

		renderMouse();
	}

	renderApi.setMouse = function(p_mouse){
		mouse = p_mouse;
	}

	renderApi.getCamera = function(){
		return camera
	}

	return renderApi;

});
