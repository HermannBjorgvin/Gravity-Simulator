// render

define(['jquery', 'underscore'], function($, _){
	
	/**************
		Private
	**************/

	var spacetime 		= undefined;
	var canvas 			= undefined;
	var ctx 			= undefined;
	var renderLoop  	= undefined; 
	var fps				= 60;
	var massMultiplier 	= undefined; // Object size multiplier
	var mouse = {
		visible: false
	};
	var camera = {
		x:0,
		y:0,
		cameraZoom: 1
	};
	var settings = {
		showGrid: true
	}

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

	var renderObject = function(object){
		// Formula for radius from volume
		var radius = Math.cbrt(object.mass*object.density*massMultiplier / 4/3*Math.PI);

		ctx.beginPath();
		ctx.arc(object.x + camera.x, object.y + camera.y, radius, 0, 2 * Math.PI, false);
		ctx.fillStyle = '#777';
		if (object.cameraFocus === true) {
			ctx.fillStyle = '#C88';
		};
		ctx.fill();
		/*if (object.cameraFocus === true) {
			ctx.arc(object.x + camera.x, object.y + camera.y, radius + 2., 0, 2 * Math.PI, false);
			ctx.lineWidth = 1;
			ctx.strokeStyle = '#C88';
			ctx.stroke();
		};*/
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

	var renderGrid = function(){
		var gridSize = 86;
		var gridWidth = Math.ceil(canvas.width/gridSize)+2;
		var gridHeight = Math.ceil(canvas.height/gridSize)+2;

		for (var i = gridWidth - 1; i >= 0; i--) {
			ctx.beginPath();

			ctx.moveTo(i*gridSize-(gridSize-camera.x%gridSize), 0);
			ctx.lineTo(i*gridSize-(gridSize-camera.x%gridSize), canvas.height);

			ctx.strokeStyle = '#CCC';
			ctx.lineWidth = 1;
			ctx.stroke();
		};
		for (var i = gridHeight - 1; i >= 0; i--) {
			ctx.beginPath();

			ctx.moveTo(0, i*gridSize-(gridSize-camera.y%gridSize));
			ctx.lineTo(canvas.width, i*gridSize-(gridSize-camera.y%gridSize));

			ctx.strokeStyle = '#CCC';
			ctx.lineWidth = 1;
			ctx.stroke();
		};
	}

	/*************
		Public
	*************/

	var renderApi = {};

	renderApi.initialize = function(p_canvas, p_spacetime, p_massMultiplier){
		canvas = p_canvas;
		ctx = canvas.getContext('2d');
		spacetime = p_spacetime;
		massMultiplier = p_massMultiplier;

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

		if (settings.showGrid === true) {
			renderGrid();	
		};

		for (var i = spacetime.length - 1; i >= 0; i--) {
			renderObject(spacetime[i]);
		};

		renderMouse();
	}

	renderApi.toggleGrid = function(){
		settings.showGrid = !settings.showGrid;
	}

	renderApi.updateMassMultiplier = function(p_massMultiplier){
		massMultiplier = p_massMultiplier;
	}

	renderApi.setMouse = function(p_mouse){
		mouse = p_mouse;
	}

	renderApi.getCamera = function(){
		return camera
	}

	return renderApi;

});
