// modules/render

define(['jquery', 'underscore'], function($, _){
	
	// -----------
	// | Private |
	// -----------

	var spacetime 		= undefined,
		canvas 			= undefined,
		ctx 			= undefined,
		renderLoop  	= undefined,
		fps				= 60,
		massMultiplier 	= undefined; // Object size multiplier
	
	var mouse = {
		visible: true,
		x: 0,
		y: 0,
		x2: 0,
		y2: 0,
		leftMouseDown: false,
		onMove: function(e){
			// console.log("We're moving!");

			this.x = e.pageX - canvas.offsetLeft;
			this.y = e.pageY - canvas.offsetTop;

			if(this.leftMouseDown === true){
				camera.xOffset += this.x - this.x2;
				camera.yOffset += this.y - this.y2;
			}

			this.x2 = this.x;
			this.y2 = this.y;
		},
		onMouseDown: function(e){
			if (e.which === 1) {
				this.leftMouseDown = true;
			}

			this.x2 = this.x;
			this.y2 = this.y;
		},
		onMouseUp: function(e){
			if (e.which === 1) {
				this.leftMouseDown = false;
			}
		},
		onScroll: function(e){
			var x, y;

			if (e.deltaY > 0) {
				// zoom out
				camera.zoom = Math.max(0.1, camera.zoom * 0.9);

				camera.x *= 0.9;
				camera.y *= 0.9;
			} else if (e.deltaY < 0){
				// zoom in
				camera.zoom = Math.min(10, camera.zoom * 1.1);

				camera.x *= 1.1;
				camera.y *= 1.1;
			}
		}
	};
	var camera = {
		x: -300,
		y: -300,
		xOffset: 0,
		yOffset: 0,
		zoom: 0.5,
		getX: function(p_x){
			var x = (p_x*this.zoom - this.x+this.xOffset*this.zoom);

			return x;
		},
		getY: function(p_y){
			var y = (p_y*this.zoom - this.y+this.yOffset*this.zoom);

			return y;
		},
		getMouseX: function(p_x){
			var x = this.x+this.xOffset + p_x/this.zoom;

			return x;
		},
		getMouseY: function(p_y){
			var y = this.y+this.yOffset + p_y/this.zoom;

			return y;
		}
	};
	var settings = {
		showGrid: true,
		showObjectPath: true
	}

	// Render functions

	function clearCanvas(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
	}
    
	function renderObject(object){
		// --------------------
		// | Draw object path |
	    // --------------------
	    if (settings.showObjectPath) {
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

	/*
		Debug function, renders transparent bounds where the mouse can move to the border to drag camera
	*/
	function renderCameraMoveBounds(){
		ctx.fillStyle = 'rgba(255, 0, 0, 0.125)';

		ctx.fillRect(0, 0, 150, canvas.height); // left
		ctx.fillRect(150, 0, canvas.width - 300, 150); // top
		ctx.fillRect(canvas.width - 150, 0, 150, canvas.height); // right
		ctx.fillRect(150, canvas.height - 150, canvas.width - 300, 150); // bottom
	}

	/* Renders grid accoding to grid size and camera position and zoom */
	function renderGrid(spacing, color){
		var gridSize = spacing * camera.zoom;
		var gridWidth = Math.ceil(canvas.width/gridSize)+2;
		var gridHeight = Math.ceil(canvas.height/gridSize)+2;

		for (var i = gridWidth - 1; i >= 0; i--) {
			ctx.beginPath();

			ctx.moveTo(
				i*gridSize - (camera.x-camera.xOffset)*camera.zoom%gridSize,
				0
			);
			ctx.lineTo(
				i*gridSize - (camera.x-camera.xOffset)*camera.zoom%gridSize,
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
				i*gridSize - (camera.y-camera.yOffset)*camera.zoom%gridSize
			);
			ctx.lineTo(
				canvas.width,
				i*gridSize - (camera.y-camera.yOffset)*camera.zoom%gridSize
			);

			ctx.strokeStyle = color;
			ctx.lineWidth = 1;
			ctx.stroke();
		};
	}

	function renderPointer(){
		ctx.beginPath();
		ctx.arc(
			mouse.x,
			mouse.y,
			20,
			0,
			2 * Math.PI,
			false
		);
		
		ctx.fillStyle = 'rgba(255, 0, 0, 0.125)';
		ctx.fill();
	}

	function renderFrame(spacetime){
		clearCanvas();
		centerCamera();

		if (settings.showGrid === true) {
			renderGrid(50, "#EEE");	
		};

		// renderCameraMoveBounds();	
		
		for (var i = spacetime.length - 1; i >= 0; i--) {
			renderObject(spacetime[i]);
		};

		renderPointer();
	}

	// Gui functions
	function centerCamera(){
		var l_spacetime = spacetime.getSpace();

		for (var i = l_spacetime.length - 1; i >= 0; i--) {
			var object = l_spacetime[i]
			if (object.cameraFocus == true) {
				camera.x = object.x - canvas.width/2/camera.zoom;
				camera.y = object.y - canvas.height/2/camera.zoom;
				break;
			};
		};
	}

	function focusCamera(x, y){
		var objects = spacetime.getSpace();
		
		for (var i = objects.length - 1; i >= 0; i--) {
			objects[i].cameraFocus = false;
		};

		for (var i = 0; i < objects.length; i++) {
			if (
				Math.abs(objects[i].x - x) < 50 &&
				Math.abs(objects[i].y - y) < 50
			){
				objects[i].cameraFocus = true;
				break;
			}
		}
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

		$('.new-menu .actions li').on('click', function(){
			var action = $(this).attr('action');

			switch(action){
				case 'toggle-grid':
					settings.showGrid = !settings.showGrid;
			break;
			}
		});

		// flag that indicates in mouse up event if it was a drag or click
		// 0 = click, 1 = drag.
		var clickOrDrag = 0;

		canvas.onmousedown = function (e) {
			clickOrDrag = 0;

			if (e.which === 1) {
				// console.log('left down');
			}
			else if (e.which === 3) {
				// console.log('right down');
			};

			mouse.onMouseDown(e);
		};

		canvas.onmousemove = function (e) {
			clickOrDrag = 1;

			mouse.onMove(e);
		}

		canvas.onmouseup = function (e) {

			// If it was a drag delegate to mouse drag
			if (clickOrDrag === 1) {
				mouse.onMouseUp(e);

				console.log('that was a drag...')
			}
			else if(clickOrDrag === 0){
				var x = (camera.getMouseX(e.pageX - canvas.offsetLeft));
				var y = (camera.getMouseX(e.pageY - canvas.offsetTop));

				console.log('attempting to focus...');
				focusCamera(x, y);

				mouse.onMouseUp(e);
			}

		};

		canvas.onwheel = function(e){
			mouse.onScroll(e);
		}

		renderLoop = setInterval(function(){
			renderFrame(spacetime.getSpace());
		}, 1000/fps);
	}

	return api;

});
