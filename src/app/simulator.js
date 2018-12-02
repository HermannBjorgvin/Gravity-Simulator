// app

import canvasUtil from './utility/canvasUtil';
import render from './modules/render';
import spacetime from './modules/spacetime';
import gui from './modules/gui';

var app = {};

app.start = function(el){
	var canvas = el;
	var massMultiplier = 200;

	// Initialize the canvas utility, includes features such as autoresize
	canvasUtil.initialize(canvas);
	canvasUtil.autoResize();

	// Initialize spacetime simulation
	spacetime.initialize(massMultiplier);

	// Initialize render module
	render.initialize(canvas, spacetime, massMultiplier);

	// Initialize GUI
	gui.initialize(spacetime, render, canvas, massMultiplier);

	// Solar system
	(function solarSystem(){
		// star
    spacetime.addObject({
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
		// mercury
    spacetime.addObject({
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
    // mars
		spacetime.addObject({
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
		// earth
    spacetime.addObject({
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
    // moon
		spacetime.addObject({
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

		for (let i = 10; i >= 0; i--) {
			var rad = Math.PI * 2 * Math.random();
			var dist = 50 + 70 * Math.random();

			var x = Math.cos(rad)*dist + 200;
			var y = Math.sin(rad)*dist + 200;

			spacetime.addObject({
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
		}
	})();
}

export default app;
