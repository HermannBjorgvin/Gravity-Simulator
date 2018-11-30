// modules/gui
// handles user input between spacetime and renderer

define([
	'jquery',
	'underscore'
], function ($, _) {

	/**************
		Private
	**************/

	var spacetime = undefined;
	var render = undefined;
	var canvas = undefined;
	var massMultiplier = undefined; // How exagurated the size of the objects are (humans like that)
    var orbitMass = undefined; // The size (in effective mouse pixels) of the default orbiting masses
    var diskDensity = undefined; // the density of disk generation
    
	// Function that controls the left mouse which controls the massbuilder
	/*
		States:
			placement
			mass
			velocity
            disk
	*/

	var mouse = {
		visible: true,
		x: 0,
		y: 0,
		x2: 0,
		y2: 0,
		radius: 0,
		state: 'placement',
		orbit: 'custom'
	};

	var massBuilder = function (e) {
		switch (mouse.state) {
			case 'placement':
				// This state ^
				mouse.state = 'mass';
				mouse.x2 = e.clientX;
				mouse.y2 = e.clientY;
				mouse.radius = 0;
				break;
			case 'mass':
				// This state ^
				mouse.radius = Math.sqrt(Math.pow(mouse.x - mouse.x2, 2) + Math.pow(mouse.y - mouse.y2, 2));
				if (e.type === 'mousedown') {
					if (mouse.orbit == 'custom') {

						mouse.state = 'velocity';
					}
					else { //auto-orbiting
						var mass = (4 / 3 * Math.PI) * Math.pow(mouse.radius, 3) / massMultiplier;
						autoOrbit(e, mass);

						//Reset state machine
						mouse.state = 'placement';
						mouse.radius = 0;
					}
				}
				break;
			case 'disk':
				// This state ^
				mouse.radius = Math.sqrt(Math.pow(mouse.x - mouse.x2, 2) + Math.pow(mouse.y - mouse.y2, 2));
				if (e.type === 'mousedown') {
					var mass = (4 / 3 * Math.PI) * Math.pow(orbitMass, 3) / massMultiplier;
					var count = ( Math.PI * Math.pow(mouse.radius, 2) / (50*50*render.getCamera().zoom*render.getCamera().zoom) ) * diskDensity;
                    
                    for(var i = 0; i < count; i++) {
                        var pt_angle = Math.random() * 2 * Math.PI;
                        var pt_radius_sq = Math.random() * mouse.radius * mouse.radius;
                        var pt_x = Math.sqrt(pt_radius_sq) * Math.cos(pt_angle);
                        var pt_y = Math.sqrt(pt_radius_sq) * Math.sin(pt_angle);
                        
            			var x = render.getCamera().getMouseX(mouse.x2 + pt_x);
            			var y = render.getCamera().getMouseY(mouse.y2 + pt_y);
                        autoOrbit(e, mass, x, y); 
                    }
					//Reset state machine
					mouse.state = 'placement';
					mouse.radius = 0;
				}
				break;
			case 'velocity':
				// This state ^

				if (e.type === 'mousedown') {
					mouse.radius /= render.getCamera().zoom;

					spacetime.addObject({
						x: render.getCamera().getMouseX(mouse.x2),
						y: render.getCamera().getMouseY(mouse.y2),
						velX: -(mouse.x - mouse.x2) / 100,
						velY: -(mouse.y - mouse.y2) / 100,
						mass: (4 / 3 * Math.PI) * Math.pow(mouse.radius, 3) / massMultiplier,
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

	var autoOrbit = function (e, mass, x, y) {
	    var focusedObject = spacetime.getFocusedObject();
	    if (focusedObject === false)
	        return;
		if(x === undefined || y === undefined) {
    		if (menuCustomMass) {
    			x = render.getCamera().getMouseX(mouse.x2);
    			y = render.getCamera().getMouseY(mouse.y2);
    		}
    		else {
    			x = render.getCamera().getMouseX(mouse.x);
    			y = render.getCamera().getMouseY(mouse.y);
    		}
        }
		var deg = Math.atan2(y - focusedObject.y, x - focusedObject.x);

		var meanOrbitalVelocity = Math.sqrt(focusedObject.mass / Math.sqrt(Math.pow(focusedObject.x - x, 2) + Math.pow(focusedObject.y - y, 2)))

		var velX = (function () {
			var velX = focusedObject.velX;

			velX += Math.cos(deg + Math.PI / 2) * meanOrbitalVelocity;

			return velX;
		})();

		var velY = (function () {
			var velY = focusedObject.velY;

			velY += Math.sin(deg + Math.PI / 2) * meanOrbitalVelocity;

			return velY;
		})();

		spacetime.addObject({
			x: x,
			y: y,
			velX: velX,
			velY: velY,
			mass: mass,
			density: 1,
			path: []
		});
	}

	var mouseMove = function (e) {
		// console.log('x:' + e.clientX + ' y:' + e.clientY);
		mouse.x = e.clientX;
		mouse.y = e.clientY;

		if (mouse.state === 'mass' || mouse.state === 'velocity' || mouse.state === 'disk') {
			massBuilder(e);
		};

		render.setMouse(mouse);
	}

	/*************
		Public
	*************/

	var guiApi = {};
	var menuCustomMass, menuShowGrid;
	guiApi.initialize = function (p_spacetime, p_render, p_canvas, p_massMultiplier) {
		spacetime = p_spacetime;
		render = p_render;
		canvas = p_canvas;
		massMultiplier = p_massMultiplier;
        
		menuShowGrid = document.getElementById('menu-toggle-grid');
		render.setDrawGrid(menuShowGrid.checked);
		menuShowGrid.addEventListener('change', function () {
			render.setDrawGrid(menuShowGrid.checked);
		});
		menuCustomMass = document.getElementById('menu-toggle-custom-mass').checked;
		document.getElementById('menu-toggle-custom-mass').addEventListener('change', function () {
			menuCustomMass = document.getElementById('menu-toggle-custom-mass').checked;
		});
        
		render.setDrawPath(document.getElementById('menu-toggle-draw-path').checked);
		document.getElementById('menu-toggle-draw-path').addEventListener('change', function () {
		    render.setDrawPath(document.getElementById('menu-toggle-draw-path').checked);
		});
        
		document.getElementById('menu-reset-camera').onmousedown = function () {
		    render.resetCamera();
		}
        
		document.getElementById('menu-gen-disk').onmousedown = function () {
    	    var focusedObject = spacetime.getFocusedObject();
    	    if (focusedObject === false)
    	        return;
		    mouse.state = 'disk'
            mouse.x2 = render.getCamera().getX(focusedObject.x)
            mouse.y2 = render.getCamera().getY(focusedObject.y)
		}

		var massMultiplierInput = document.getElementById('menu-mass-multiplier');
		massMultiplierInput.value = 200;
		massMultiplierInput.addEventListener('change', function () {
			massMultiplier = massMultiplierInput.value;
			render.updateMassMultiplier(massMultiplierInput.value);
			spacetime.updateMassMultiplier(massMultiplierInput.value);
		});
        
		var orbitMassInput = document.getElementById('menu-orbit-mass');
		orbitMassInput.value = 2;
        orbitMass = 2;
		orbitMassInput.addEventListener('change', function () {
			orbitMass = orbitMassInput.value;
			//render.updateOrbitMass(massMultiplierInput.value);
			//spacetime.updateMassMultiplier(massMultiplierInput.value);
		});
        
		var diskDensityInput = document.getElementById('menu-disk-density');
		diskDensityInput.value = 2;
        diskDensity = 2;
		diskDensityInput.addEventListener('change', function () {
			diskDensity = diskDensityInput.value;
			//render.updateOrbitMass(massMultiplierInput.value);
			//spacetime.updateMassMultiplier(massMultiplierInput.value);
		});

		var zoomInput = document.getElementById('menu-zoom');
		zoomInput.value = 1;
		render.changeZoom(zoomInput.value);
		zoomInput.addEventListener('change', function () {
			render.changeZoom(zoomInput.value);
		});

		var speedInput = document.getElementById('menu-speed');
		speedInput.value = 1;
		speedInput.addEventListener('change', function () {
			spacetime.calculationSpeed(speedInput.value);
		});

		var clearspacebtn = document.getElementById('menu-clear-spacetime');
		clearspacebtn.addEventListener('click', function () {
			spacetime.clearSpacetime();
		});

		var cyclefocusbtn = document.getElementById('menu-cycle-focus');
		document.getElementById('menu-cycle-focus').onmousedown = function (e) {
			spacetime.cycleFocus((e.which == 1) ? true : false);
		};

		canvas.onmousedown = function (e) {
			if (e.which === 1) {
				// console.log('left mouse click');
				// console.log(spacetime.getSpace().length);
                if(mouse.state === 'drag') {
                    massBuilder(e);
                } else if ((mouse.state != 'placement' && mouse.orbit == 'auto')) { //if user was trying to put an auto-orbiting mass, and clicked left button, then he is probably trying to cancel. Cancel then.
					// Reset state machine
					mouse.state = 'placement';
					mouse.radius = 0;
				}
				else {
					mouse.orbit = 'custom';
					massBuilder(e);
				}
			}
			else if (e.which === 3) {
				// console.log('right mouse click');
                if(mouse.state === 'drag') {
					mouse.state = 'placement';
					mouse.radius = 0;
                } else if ((mouse.state != 'placement' && mouse.orbit == 'custom')) { //if user was trying to put a custom mass, and clicked right button, then he is probably trying to cancel. Cancel then.
					// Reset state machine
					mouse.state = 'placement';
					mouse.radius = 0;
				}
				else {
					mouse.orbit = 'auto';
					if (menuCustomMass)
						massBuilder(e)
					else
						autoOrbit(e, (4 / 3 * Math.PI) * Math.pow(orbitMass, 3) / massMultiplier);
				}
			};
		};

		canvas.onmousemove = function (e) {
			mouseMove(e);
		}
	}

	return guiApi;

});
