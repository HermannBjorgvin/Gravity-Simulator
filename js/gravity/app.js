// app

define([
	'jquery',
	'underscore',
	'utility/canvasUtil',
	'modules/render',
	'modules/spacetime',
	'modules/gui'
], function($, _, canvasUtil, render, spacetime, gui){

	var app = {};

	app.initialize = function(canvasId){
		var canvas = document.getElementById(canvasId);
		var ctx = canvas.getContext('2d');
		var massMultiplier = 200;
		
		// Initialize the canvas utility, includes features such as autoresize
		canvasUtil.initialize(canvas);
		canvasUtil.autoResize();

		// Initialize spacetime simulation
		spacetime.initialize(massMultiplier);
		spacetime.startLoop();

		// Initialize render module
		render.initialize(canvas, spacetime, massMultiplier);
		render.startLoop();

		// Initialize GUI
		gui.initialize(spacetime, render, canvas, massMultiplier);
	
		// Solar system
		(function solarSystem(){
			var star = spacetime.addObject({
				cameraFocus: true,
				x: 200,
				y: 200,
				velX: 0,
				velY: 0,
				deltaVelX: 0,
				deltaVelY: 0,
				mass: 500,
				density: 0.3,
				path: []
			});
			var mercury = spacetime.addObject({
				x: 230,
				y: 200,
				velX: 0,
				velY: Math.sqrt(500/30),
				deltaVelX: 0,
				deltaVelY: 0,
				mass: 0.5,
				density: 1,
				path: []
			});
			var mars = spacetime.addObject({
				x: 0,
				y: 200,
				velX: 0,
				velY: -Math.sqrt(500/200),
				deltaVelX: 0,
				deltaVelY: 0,
				mass: 3,
				density: 1,
				path: []
			});
			var earth = spacetime.addObject({
				x: 550,
				y: 200,
				velX: 0,
				velY: Math.sqrt(500/350),
				deltaVelX: 0,
				deltaVelY: 0,
				mass: 6,
				density: 0.6,
				path: []
			});
			var moon = spacetime.addObject({
				x: 570,
				y: 200,
				velX: 0,
				velY: Math.sqrt(500/350) + Math.sqrt(6/20),
				deltaVelX: 0,
				deltaVelY: 0,
				mass: 0.1,
				density: 1,
				path: []
			});

			for (var i = 10; i >= 0; i--) {
				var rad = Math.PI * 2 * Math.random();
				var dist = 50 + 70 * Math.random();

				var x = Math.cos(rad)*dist + 200;
				var y = Math.sin(rad)*dist + 200;

				var a = spacetime.addObject({
					x: x,
					y: y,
					velX: Math.cos(rad + Math.PI/2+(Math.PI/180*6-Math.PI/180*12)*0) * Math.sqrt(500/dist),
					velY: Math.sin(rad + Math.PI/2+(Math.PI/180*6-Math.PI/180*12)*0) * Math.sqrt(500/dist),
					deltaVelX: 0,
					deltaVelY: 0,
					mass: 0.0025,
					density: 4,
					path: []
				});
			};
		})();

		// asteroid belt around a center star
		// var starmass = 10000;
		/*var blackhole = spacetime.addObject({
			x: 0,
			y: 0,
			velX: 0,
			velY: 0,
			deltaVelX: 0,
			deltaVelY: 0,
			mass: starmass,
			density: 0.0001,
			path: []
		});*/

		/*for (var i = 0; i < 1000; i++) {
			var radian = Math.random() * 2 * Math.PI;

			var height = canvas.height;
			var width = canvas.width;

			// var distance = Math.sqrt(Math.pow(370, 2) * Math.random()) + 30; // Distributed
			var distance = Math.random()*370; // Favorable to cluster near center

			var x = Math.cos(radian)*distance;
			var y = Math.sin(radian)*distance;

			var beltSpeed = 0.125;
			var speedRand = Math.random() * 0.01 + 0.995

			spacetime.addObject({
				x: x,
				y: y,
				velX: Math.cos(radian + Math.PI/2 + (Math.PI/180*0.5 - Math.PI/180*1)) * Math.sqrt(1.55/distance) * speedRand,
				velY: Math.sin(radian + Math.PI/2 + (Math.PI/180*0.5 - Math.PI/180*1)) * Math.sqrt(1.55/distance) * speedRand,
				deltaVelX: 0,
				deltaVelY: 0,
				mass: 0.0125,
				density: 1,
				path: []
			});
		};*/
	}

	return app;

});
