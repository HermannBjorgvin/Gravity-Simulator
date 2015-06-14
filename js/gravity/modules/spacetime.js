// modules/spacetime

define([
	'jquery',
	'underscore'
], function($, _){
	
	/**************
		Private
	**************/

	var spacetime = []; // If this were real life we'd just call this variable "the universe"

	// Simulation settings
	var calculationsPerSec = 50; // How many gravitational calculations are performed a second
	var calculationSpeed = 1; // Speed comes at the cost of accuracy
	var massMultiplier = undefined; // How exagurated the size of the objects are (humans like that)

	var spacetimeLoop; // Variable that stores our setInterval loop

	function getVelocity(object){
		var velocity = Math.sqrt(Math.pow(object.velX, 2)+Math.pow(object.velY, 2));

		return velocity;
	}

	function getMomentum(object){
		var velocity = getVelocity(object);

		return velocity * object.mass;
	}

	// WRONG MATH DON'T USE, also just throw this function away, I currently have no use for it
	function getRelativeMomentum(objectA, objectB){
		// WRONG MATH DON'T USE
		var relative = Math.sqrt(
			Math.pow(objectA.velX - objectB.velX, 2)+
			Math.pow(objectA.velY - objectB.velY, 2)
		);

		// WRONG MATH DON'T USE
		return relative;
	}
    // END OF WRONG MATH... hopefully

	function pythagoras(objectA, objectB){
		var distance = Math.sqrt(Math.pow(objectA.x - objectB.x, 2)+Math.pow(objectA.y - objectB.y, 2));

		return distance;
	}

	function getObjectRadius(object){
		return Math.cbrt(object.mass*object.density*massMultiplier / 4/3*Math.PI);
	}

	/*************
		Public
	*************/

	var spacetimeApi = {};

	spacetimeApi.initialize = function(p_massMultiplier){
		massMultiplier = p_massMultiplier;
	}

	spacetimeApi.updateMassMultiplier = function(p_massMultiplier){
		massMultiplier = p_massMultiplier;
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
		var self = this;

		/*
			find colliding objects

			If the objects are localized and clustering they are joined
			but only if they're within each others radius

			If the objects are fast moving and have enough impact force
			(mass times speed) they are broken into several smaller pieces
			
			IMPORTANT NOTE: No momentum can be added, the added momentum
			of two colliding objects should still be the same after they
			break into pieces and scatter around. Be vary of Math.random()

			Google: conservation of momentum formula
			mass * velocity	
		*/

		// Find clustering objects and join them - unfinished
		for (var a = spacetime.length - 1; a >= 0; a--) {
			var objectA = spacetime[a];

			for (var b = spacetime.length - 1; b >= 0; b--) {
				if (a !== b) {
					var objectB = spacetime[b];

					if (
						pythagoras(objectA, objectB) < getObjectRadius(objectA) + getObjectRadius(objectB)
					){
						var camFocus = false;
						if(objectB.cameraFocus === true || objectA.cameraFocus === true){
							camFocus = true;
						}

						// Splice the objects from 
						spacetime = _.without(spacetime, objectA);
						spacetime = _.without(spacetime, objectB);

						var newMass = objectA.mass + objectB.mass;
						var massRatio = objectA.mass/newMass;

						var newMomentum = getMomentum(objectA) + getMomentum(objectB);
						var momentumRatio = newMomentum/getMomentum(objectA);

						var newDensity = objectA.density*massRatio + objectB.density*(1-massRatio);

						var newObject = {
							cameraFocus: camFocus,
							x: objectA.x*getMomentum(objectA)/newMomentum + objectB.x*getMomentum(objectB)/newMomentum, // Change later
							y: objectA.y*getMomentum(objectA)/newMomentum + objectB.y*getMomentum(objectB)/newMomentum, // Change later
							velX: objectA.velX*objectA.mass/newMass + objectB.velX*objectB.mass/newMass, // Change later
							velY: objectA.velY*objectA.mass/newMass + objectB.velY*objectB.mass/newMass, // Change later
							deltaX:0, // useless info
							deltaY:0, // useless info
							mass: newMass, 
							density: newDensity,
							path: []
						};

						// Give the new object the larger objects previous path, looks nicer
						var newPath = objectA.mass >= objectB.mass ? objectA.path : objectB.path;
						newObject.path = newPath;

						spacetime.push(newObject);
					};
				};
			};
		};

		///////////////////////////////////////////////////////////////////////////////////////////

		var spacetimeNextVelocity = []; // calculate velocity

		// Updates the universe and shit
		for (var a = spacetime.length - 1; a >= 0; a--) {
			var objectA = spacetime[a];
			objectA.deltaX = 0;
			objectA.deltaY = 0;

			// Calculate forces applied to objects
			for (var b = spacetime.length - 1; b >= 0; b--) {
				if (b !== a) {
					var objectB = spacetime[b];

					// Pythagoras
					var distance = Math.sqrt(Math.pow(objectA.x-objectB.x,2)+Math.pow(objectA.y-objectB.y,2));
					
					// Find angle from vector. Fun note, if we reverse objectA and B we have anti-gravity
					var angleToMass = Math.atan2(objectB.y-objectA.y, objectB.x-objectA.x);

					// All credit for this formula goes to an Isaac Newton
					objectA.deltaX += (
						Math.cos(angleToMass) *
						(objectB.mass/Math.max(Math.pow(distance,2), 1))
					);
					objectA.deltaY += (
						Math.sin(angleToMass) *
						(objectB.mass/Math.max(Math.pow(distance,2), 1))
					);
				};
			};
		};

		// Apply changes to objects for this iteration
		for (var i = spacetime.length - 1; i >= 0; i--) {
			var object = spacetime[i];

			// add coords to object path
			object.path.push({
				x: object.x,
				y: object.y
			});

			// Limit path length
			if (object.path.length > Math.min(40, 100/Math.pow(getVelocity(object),2))) {
				object.path.splice(0, 1);
			};
			
			object.velX += object.deltaX * calculationSpeed;
			object.velY += object.deltaY * calculationSpeed;
			
			object.x += object.velX * calculationSpeed;
			object.y += object.velY * calculationSpeed;

			spacetimeNextVelocity.push(object);
		};

		spacetime = spacetimeNextVelocity;
	}

	return spacetimeApi;

});
