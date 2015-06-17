// modules/gui
// handles user input between spacetime and renderer

define([
	'jquery',
	'underscore'
], function($, _){

	/**************
		Private
	**************/

	var spacetime      = undefined;
	var render 		   = undefined;
	var canvas 		   = undefined;
	var massMultiplier = undefined; // How exagurated the size of the objects are (humans like that)

	// Function that controls the left mouse which controls the massbuilder
	/*
		States:
			placement
			mass
			velocity
	*/
	
	var mouse = {
		visible: true,
		x: 0,
		y: 0,
		x2: 0,
		y2: 0,
		radius: 0,
		state: 'placement'
	};

	var massBuilder = function(e){
		switch(mouse.state){
			case 'placement':
				// This state ^
				mouse.state = 'mass';
				mouse.x2 = e.clientX;
				mouse.y2 = e.clientY;
				mouse.radius = 0;
			break;
			case 'mass':
				// This state ^
				mouse.radius = Math.sqrt(Math.pow(mouse.x-mouse.x2,2)+Math.pow(mouse.y-mouse.y2,2));
				
				if (e.type === 'mousedown') {
					mouse.state = 'velocity';
				};
			break;
			case 'velocity':
				// This state ^

				if (e.type === 'mousedown') {
					spacetime.addObject({
						x: render.getCamera().getMouseX(mouse.x2),
						y: render.getCamera().getMouseY(mouse.y2),
						velX: -(mouse.x - mouse.x2) / 100,
						velY: -(mouse.y - mouse.y2) / 100,
						mass: (4/3*Math.PI) * Math.pow(mouse.radius, 3) / massMultiplier,
						density: 1,
						path: []
					});

					// Reset state machine
					mouse.state = 'placement';
					mouse.radius = 0;
				};
			break;
		}
	}

	var mouseMove = function(e){
		// console.log('x:' + e.clientX + ' y:' + e.clientY);
		mouse.x = e.clientX;
		mouse.y = e.clientY;

		if (mouse.state === 'mass' || mouse.state === 'velocity') {
			massBuilder(e);
		};

		render.setMouse(mouse);
	}

	/*************
		Public
	*************/

	var guiApi = {};

	guiApi.initialize = function(p_spacetime, p_render, p_canvas, p_massMultiplier){
		spacetime = p_spacetime;
		render = p_render;
		canvas = p_canvas;
		massMultiplier = p_massMultiplier;

		document.getElementById('menu-toggle-grid').addEventListener('change', function(){
			render.toggleGrid();
		});

		var massMultiplierInput = document.getElementById('menu-mass-multiplier');
		massMultiplierInput.addEventListener('change', function(){
			massMultiplier = massMultiplierInput.value;
			render.updateMassMultiplier(massMultiplierInput.value);
			spacetime.updateMassMultiplier(massMultiplierInput.value);
		});

		var zoomInput = document.getElementById('menu-zoom');
		zoomInput.addEventListener('change', function(){
			render.changeZoom(zoomInput.value);
		});

		canvas.onmousedown = function(e){
			if (e.which === 1) {
				// console.log('left mouse click');
				// console.log(spacetime.getSpace().length);
				massBuilder(e);
			}
			else if(e.which === 3){
				// console.log('right mouse click');
			};
		};

		canvas.onmousemove = function(e){
			mouseMove(e);
		}
	}

	return guiApi;

});
