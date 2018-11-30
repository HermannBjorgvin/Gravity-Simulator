// modules/render

define(['jquery', 'underscore'], function($, _){
	
	// -----------
	// | Private |
	// -----------

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
		marginX:0,
		marginY:0,
        marginZoom:0,
		preferredX:0,
		preferredY:0,
		preferredZoom:0,
		drag:50,
		xIT:0,
		yIT:0,
        zoomIT:0,
		zoom: 0,
		locked: true,
		getX: function(p_x){
			var x = (p_x*this.zoom - this.x*this.zoom);

			return x;
		},
		getY: function(p_y){
			var y = (p_y*this.zoom - this.y*this.zoom);

			return y;
		},
		getMouseX: function(p_x){
			var x = this.x + p_x/this.zoom;

			return x;
		},
		getMouseY: function(p_y){
			var y = this.y + p_y/this.zoom;

			return y;
		}
	};
	var settings = {
		showGrid: true
	}

	function clearCanvas(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
	}

	var zoomInput = document.getElementById('menu-zoom');
	function moveCamera(e){
        
		switch(String.fromCharCode(e.charCode).toLowerCase()){
			case 'w':
				camera.preferredY -= camera.drag;
				camera.yIT = fps;
				break;
			case 'a':
				camera.preferredX -= camera.drag;
				camera.xIT = fps;
				break;
			case 's':
				camera.preferredY += camera.drag;
				camera.yIT = fps;
				break;
			case 'd':
				camera.preferredX += camera.drag;
				camera.xIT = fps;
				break;
		    case 'e':
		        camera.preferredZoom = Math.round((camera.preferredZoom + 0.1) * 10) / 10;
		        zoomInput.value = camera.preferredZoom;
		        camera.zoomIT = fps;
		        break;
		    case 'q':
		        if (camera.preferredZoom > 0) {
		            camera.preferredZoom = Math.round((camera.preferredZoom - 0.1) * 10) / 10;
		            zoomInput.value = camera.preferredZoom;
		            camera.zoomIT = fps;
		        }
		        break;
		    case 'r':
		        api.resetCamera();
		        break;
		}
	}

	var initialMarginX = 0, initialMarginY = 0, initialMarginZoom = 0;
	var offsetX = 0, offsetY = 0, offsetZoom = 0;
	function centerCamera(){
		var l_spacetime = spacetime.getSpace();
		for (var i = l_spacetime.length - 1; i >= 0; i--) {
			var object = l_spacetime[i]
			if (object.cameraFocus == true) {
				if(camera.xIT > 0) {
				    if (camera.xIT == fps) {
				        offsetX = camera.preferredX - camera.marginX;
				        initialMarginX = camera.marginX;
				    }
					camera.xIT -= 1;
					camera.marginX = initialMarginX + Math.sign(offsetX) * Math.sqrt(Math.pow(offsetX,2) - Math.pow(offsetX * (fps - camera.xIT)/fps - offsetX,2));
				}
				else camera.marginX = camera.preferredX;

				if (camera.yIT > 0) {
				    if (camera.yIT == fps) {
				        offsetY = camera.preferredY - camera.marginY;
				        initialMarginY = camera.marginY;
				    }
					camera.yIT -= 1;
					camera.marginY = initialMarginY + Math.sign(offsetY) * Math.sqrt(Math.pow(offsetY,2) - Math.pow(offsetY * (fps - camera.yIT)/fps - offsetY,2));
				}
				else camera.marginY = camera.preferredY;
				
				if (camera.zoomIT > 0) {
				    if (camera.zoomIT == fps) {
				        offsetZoom = camera.preferredZoom - camera.zoom;
				        initialMarginZoom = camera.zoom;
				    }

				    camera.zoomIT -= 1;
				    camera.zoom = initialMarginZoom + Math.sign(offsetZoom) * Math.sqrt(Math.pow(offsetZoom, 2) - Math.pow(offsetZoom * (fps - camera.zoomIT)/fps - offsetZoom, 2));
				} else camera.zoom = camera.preferredZoom;

				camera.x = object.x - canvas.width / 2 / camera.zoom + camera.marginX;
				camera.y = object.y - canvas.height / 2 / camera.zoom + camera.marginY;
			};
		};
	}
	var menuDrawPath = false;
    
	function renderObject(object){
		// --------------------
		// | Draw object path |
	    // --------------------
	    if (menuDrawPath) {
	        (function () {
	            if (object.path.length > 3) {
	                ctx.beginPath();
	                ctx.moveTo(
                        camera.getX(object.path[0].x),
                        camera.getY(object.path[0].y)
                    );

	                for (i = 1; i < object.path.length - 2; i++) {
	                    var xc = (object.path[i].x + object.path[i + 1].x) / 2;
	                    var yc = (object.path[i].y + object.path[i + 1].y) / 2;

	                    ctx.quadraticCurveTo(
                            camera.getX(object.path[i].x),
                            camera.getY(object.path[i].y),
                            camera.getX(xc),
                            camera.getY(yc)
                        );
	                }

	                // curve through the last two points
	                ctx.quadraticCurveTo(
                        camera.getX(object.path[object.path.length - 2].x),
                        camera.getY(object.path[object.path.length - 2].y),
                        camera.getX(object.path[object.path.length - 1].x),
                        camera.getY(object.path[object.path.length - 1].y)
                    );

	                ctx.lineWidth = 1;
	                ctx.strokeStyle = "#666";
	                ctx.stroke();
	            };
	        })();
	    }

		// ---------------
		// | Draw object |
		// ---------------
		(function(){
			// radius from volume
			var radius = Math.cbrt(object.mass*object.density*massMultiplier / 4/3*Math.PI);

			ctx.beginPath();
			ctx.arc(
				camera.getX(object.x),
				camera.getY(object.y),
				radius*camera.zoom,
				0,
				2 * Math.PI,
				false
			);
			
			ctx.strokeStyle = "#666";
			ctx.fillStyle = "#000";
			if (object.cameraFocus === true) ctx.fillStyle = '#40A2BF';
			ctx.fill();
		})();
	}

	function renderMassBuilder(){
		if (mouse.visible === true) {

			ctx.fillStyle = '#AAA';
			switch (mouse.state) {
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
    			case 'disk':
                    ctx.fillStyle = 'rgba(170, 170, 170, 0.5)'
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

	/* Renders grid accoding to grid size and camera position and zoom */
	function renderGrid(spacing, color){
		var gridSize = spacing * camera.zoom;
		var gridWidth = Math.ceil(canvas.width/gridSize)+2;
		var gridHeight = Math.ceil(canvas.height/gridSize)+2;

		for (var i = gridWidth - 1; i >= 0; i--) {
			ctx.beginPath();

			ctx.moveTo(
				i*gridSize - camera.x*camera.zoom%gridSize,
				0
			);
			ctx.lineTo(
				i*gridSize - camera.x*camera.zoom%gridSize,
				canvas.height
			);

			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.stroke();
		};
		for (var i = gridHeight - 1; i >= 0; i--) {
			ctx.beginPath();

			ctx.moveTo(
				0,
				i*gridSize - camera.y*camera.zoom%gridSize
			);
			ctx.lineTo(
				canvas.width,
				i*gridSize - camera.y*camera.zoom%gridSize
			);

			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.stroke();
		};
	}

	function renderFrame(spacetime){
		clearCanvas();
		centerCamera();

		if (settings.showGrid === true) {
			renderGrid(50, "#EEE");	
		};

		for (var i = spacetime.length - 1; i >= 0; i--) {
			renderObject(spacetime[i]);
		};

		renderMassBuilder();		
	}

	// -----------
	// | Private |
	// -----------

	var api = {};

	api.initialize = function(p_canvas, p_spacetime, p_massMultiplier){
		canvas = p_canvas;
		ctx = canvas.getContext('2d');
		spacetime = p_spacetime;
		massMultiplier = p_massMultiplier;

		// Disable canvas context menu
		$('body').on('contextmenu', canvas, function(e){ return false; });

		// WASD camera movement
		document.addEventListener('keypress', moveCamera);
	}

	api.startLoop = function(){
		renderLoop = setInterval(function(){
			renderFrame(spacetime.getSpace());
		}, 1000/fps);
	}

	api.stopLoop = function(){
		clearInterval(renderLoop);
	}

	api.setDrawGrid = function(value){
		settings.showGrid = value;
	}

	api.updateMassMultiplier = function(p_massMultiplier){
		massMultiplier = p_massMultiplier;
	}

	api.changeZoom = function (p_zoom) {
	    camera.preferredZoom = parseFloat(p_zoom);
	    camera.zoomIT = fps;
	}
	
	api.setMouse = function(p_mouse){
		mouse = p_mouse;
	}

	api.getCamera = function(){
		return camera
	}

	api.resetCamera = function () {
	    camera.preferredX = 0;
	    camera.preferredY = 0;
	    camera.preferredZoom = 1;
	    zoomInput.value = 1;


	    camera.xIT = fps;
	    camera.yIT = fps;
	    camera.zoomIT = fps;
	}

	api.setDrawPath = function (value) {
	    menuDrawPath = value;
	}

	return api;

});
