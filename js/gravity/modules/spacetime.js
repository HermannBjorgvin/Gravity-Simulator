// modules/spacetime

define([
	'jquery',
	'underscore'
], function($, _){
	
	/**************
		Private
	**************/

	var spacetime = [];

	// Universe settings
	var calculationsPerSec = 100;
	var gravitationalConstant = 10;

	var spacetimeLoop;

	/*************
		Public
	*************/

	var spacetimeApi = {};

	spacetimeApi.create = function(){

	}

	spacetimeApi.addObject = function(object){
		spacetime.push(object);
	}

	spacetimeApi.startLoop = function(){
		var self = this;

		spacetimeLoop = setInterval(function(){
			self.calculateForces();
		}, 1000/calculationsPerSec);
	}

	spacetimeApi.stopLoop = function(){
		clearInterval(spacetimeLoop);
	}

	spacetimeApi.getSpace = function(){
		return spacetime;
	}

	spacetimeApi.calculateForces = function(){
		// Updates the universe and shit
		for (var a = spacetime.length - 1; a >= 0; a--) {
			var objectA = spacetime[a];
			objectA.deltaX = 0;
			objectA.deltaY = 0;

			// Calculate forces applied to objects
			for (var b = spacetime.length - 1; b >= 0; b--) {
				if (b !== a) {
					var objectB = spacetime[b];

					var distance = Math.sqrt(Math.pow(objectA.x-objectB.x,2)+Math.pow(objectA.y-objectB.y,2));
					var angleToMass = Math.atan2(objectB.y-objectA.y, objectB.x-objectA.x);

					objectA.deltaX += Math.cos(angleToMass) * (gravitationalConstant*objectB.mass/Math.pow(distance,2));
					objectA.deltaY += Math.sin(angleToMass) * (gravitationalConstant*objectB.mass/Math.pow(distance,2));
				};
			};
		};

		// Forces applied to objects
		for (var i = spacetime.length - 1; i >= 0; i--) {
			var object = spacetime[i];
			
			object.velX += object.deltaX;
			object.velY += object.deltaY;
			
			object.x += object.velX;
			object.y += object.velY;
		};
	}

	return spacetimeApi;

});
