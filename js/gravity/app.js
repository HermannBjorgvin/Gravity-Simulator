// app

define([
	'jquery',
	'underscore',
	'utility/canvasUtil',
	'modules/render',
	'modules/spacetime',
	'modules/gui'
], function($, _, canvasUtil, render, spacetime, gui){

	var gravity = {};

	gravity.initialize = function(canvasID){
		var canvas = document.getElementById(canvasID);
		var ctx = canvas.getContext('2d');
		var massMultiplier = 200;
		
		// Initialize the canvas utility, includes features such as autoresize
		canvasUtil.initialize(canvas);
		canvasUtil.autoResize();

		// Initialize spacetime simulation
		spacetime.initialize(massMultiplier);
		spacetime.startLoop();

		var earthToMoonDiameter = 0.012;

		// Quantery system
		/*var firstPairA = spacetime.addObject({
			x: 100,
			y: 400,
			velX: 0,
			velY: -1.2 - 0.75,
			deltaX: 0,
			deltaY: 0,
			mass: 300,
			density: 1
		});
		var firstPairB = spacetime.addObject({
			x: 200,
			y: 400,
			velX: 0,
			velY: 1.2 - 0.75,
			deltaX: 0,
			deltaY: 0,
			mass: 300,
			density: 1
		});
		var secondPairA = spacetime.addObject({
			x: 700,
			y: 400,
			velX: 0,
			velY: -1.2 + 0.75,
			deltaX: 0,
			deltaY: 0,
			mass: 300,
			density: 1
		});
		var secondPairB = spacetime.addObject({
			x: 800,
			y: 400,
			velX: 0,
			velY: 1.2 + 0.75,
			deltaX: 0,
			deltaY: 0,
			mass: 300,
			density: 1
		});*/

		// Planet with a moon with a moon
		var star = spacetime.addObject({
			cameraFocus: true,
			x: 500,
			y: 500,
			velX: 0,
			velY: - (1.25*earthToMoonDiameter) - (0.25/500*0.8) - (0.5/500*3.1),
			deltaX: 0,
			deltaY: 0,
			mass: 500,
			density: 1
		});
		var thirdRock = spacetime.addObject({
			x: 840,
			y: 500,
			velX: 0,
			velY: 1.25,
			deltaX: 0,
			deltaY: 0,
			mass: 500 * earthToMoonDiameter,
			density: 1.67
		});
		var moon = spacetime.addObject({
			x: 870,
			y: 500,
			velX: 0,
			velY: 0.8,
			deltaX: 0,
			deltaY: 0,
			mass: 0.25,
			density: 1
		});
		var closeOrbitingPlanet = spacetime.addObject({
			x: 550,
			y: 500,
			velX: 0,
			velY: 3.15,
			deltaX: 0,
			deltaY: 0,
			mass: 0.5,
			density: 1
		});
		var secondRock = spacetime.addObject({
			x: 670,
			y: 500,
			velX: 0,
			velY: 1.7,
			deltaX: 0,
			deltaY: 0,
			mass: 3,
			density: 1
		});
		/*var collidingPlanet = spacetime.addObject({
			x: 600,
			y: 250,
			velX: 1,
			velY: 1.0875,
			deltaX: 0,
			deltaY: 0,
			mass: 10,
			density: 0.4
		});*/
	
		/*var spacing = 60;
		for (var i = Math.ceil(canvas.width/spacing) - 1; i >= 0; i--) {
			for (var z = Math.ceil(canvas.height/spacing) - 1; z >= 0; z--) {
				spacetime.addObject({
					x: i*spacing,
					y: z*spacing,
					velX: Math.random() * 2 - 1,
					velY: Math.random() * 2 - 1,
					deltaX: 0,
					deltaY: 0,
					mass: 0.1,
					density: 1
				});
			};
		};*/

		// console.log(Math.ceil(canvas.width/spacing) * Math.ceil(canvas.height/spacing))


		// Initialize render module
		render.initialize(canvas, spacetime, massMultiplier);
		render.startLoop();

		// Initialize GUI
		gui.initialize(spacetime, render, canvas, massMultiplier);
	}

	return gravity;

});
