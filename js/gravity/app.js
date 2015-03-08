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

		var test = 0.25
		var earthToMoonDiameter = 0.012;

		/*spacetime.addObject({
			x: 300,
			y: 300,
			velX:0,
			velY: -test,
			deltaX: 0,
			deltaY: 0,
			mass: 60
		});

		spacetime.addObject({
			x: 700,
			y: 300,
			velX: 0,
			velY: test,
			deltaX: 0,
			deltaY: 0,
			mass: 60
		});*/

		spacetime.addObject({
			x: 400,
			y: 400,
			velX: 0,
			velY: -0.5 * earthToMoonDiameter * 2.5,
			deltaX: 0,
			deltaY: 0,
			mass: 50
		});

		spacetime.addObject({
			x: 740,
			y: 400,
			velX: 0,
			velY: 0.5 * 2.5,
			deltaX: 0,
			deltaY: 0,
			mass: 50 * earthToMoonDiameter
		});

		spacetime.addObject({
			x: 800,
			y: 400,
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
