// app

import Hammer from 'hammerjs';

import canvasUtil from './utility/canvasUtil';
import render from './modules/render';
import Spacetime from './modules/spacetime';

var app = {};

app.start = function(el, opts = {}){
	var canvas = el;

  let options = Object.assign({
    // Put default options here
    massMultiplier: 40
  }, opts);

  let hammer = new Hammer(el);

  hammer.get('pinch').set({
    enable: true
  });

	// Initialize the canvas utility, includes features such as autoresize
	canvasUtil.autoResize(canvas);

	// Initialize spacetime simulation
	let spacetime = new Spacetime(options);

	// Initialize render module
	render.initialize(el, spacetime, options);
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

  return this;
}

export default app;
