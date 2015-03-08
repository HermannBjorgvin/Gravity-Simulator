// app

define([
	'jquery',
	'underscore',
	'utility/canvasUtil',
	'modules/render',
	'modules/spacetime'
], function($, _, canvasUtil, render, spacetime){

	var gravity = {};

	gravity.initialize = function(canvasID){
		var canvas = document.getElementById(canvasID);
		var ctx = canvas.getContext('2d');
		
		// Make the canvas fill the screen
		canvasUtil.configure(canvas);
		canvasUtil.autoResize();

		// Create spacetime simulation
		spacetime.create();

		var test = 0.5;
		var earthToMoonDiameter = 0.012;

		// Quaternary star system
		/*spacetime.addObject({
			x: 300,
			y: 300,
			velX: test/2,
			velY: -test/2,
			deltaX: 0,
			deltaY: 0,
			mass: 3
		});
		spacetime.addObject({
			x: 600,
			y: 300,
			velX: test/2,
			velY: test/2,
			deltaX: 0,
			deltaY: 0,
			mass: 3
		});
		spacetime.addObject({
			x: 300,
			y: 600,
			velX: -test/2,
			velY: -test/2,
			deltaX: 0,
			deltaY: 0,
			mass: 3
		});
		spacetime.addObject({
			x: 600,
			y: 600,
			velX: -test/2,
			velY: test/2,
			deltaX: 0,
			deltaY: 0,
			mass: 3
		});*/
	
		// Planet with a moon with a moon
		spacetime.addObject({
			x: 500,
			y: 500,
			velX: 0,
			velY: -0.5 * earthToMoonDiameter * 2.5 - 0.025*0.875,
			deltaX: 0,
			deltaY: 0,
			mass: 50
		});
		spacetime.addObject({
			x: 840,
			y: 500,
			velX: 0,
			velY: 0.5 * 2.5,
			deltaX: 0,
			deltaY: 0,
			mass: 50 * earthToMoonDiameter
		});
		spacetime.addObject({
			x: 900,
			y: 500,
			velX: 0,
			velY: 0.875,
			deltaX: 0,
			deltaY: 0,
			mass: 0.025
		});

		spacetime.startLoop();

		// renderer
		render.initialize(canvas);
		setInterval(function(){
			render.renderFrame(spacetime.getSpace());
		}, 1000/60);
	}

	return gravity;

});
