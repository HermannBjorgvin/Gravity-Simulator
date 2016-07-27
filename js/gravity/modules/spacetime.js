// modules/spacetime

define([
	'jquery',
	'underscore'
], function($, _){
	
	// -----------
	// | Private |
	// -----------

		// Spacetime, array that stores all objects
		var spacetime = [];

		// Simulation settings
		var calculationsPerSec 	= 100; 	// How many gravitational calculations are performed a second
		var calculationSpeed 	= 1; 	// Speed comes at the cost of accuracy
		var massMultiplier;				// How exagurated the size of the objects are (human readable)

		// Calculation setInterval loop
		var spacetimeLoop;

		var debugLoop = setInterval(function(){
			var totalMass = 0;

			for (var i = 0; i < spacetime.length; i++) {
				totalMass += spacetime[i].mass;
			};
		}, 1000);

		// Takes object as argument, returns velocity as positive integer
		function getVelocity(object){
			var velocity = Math.sqrt(
				Math.pow(object.velX, 2)+
				Math.pow(object.velY, 2)
			);

			return velocity;
		}

		// Takes object as argument, returns momentum as positive integer (unless object mass is negative)
		function getMomentum(object){
			var velocity = getVelocity(object);

			return velocity * object.mass;
		}

		// Takes two objects as argument, returns distance between the two
		function getObjectDistance(objectA, objectB){
			var distance = Math.sqrt(
				Math.pow(objectA.x - objectB.x, 2) +
				Math.pow(objectA.y - objectB.y, 2)
			);

			return distance;
		}

		// Takes in object, returns radius from object mass and density
		function getObjectRadius(object){
			var radius = Math.cbrt(
				(object.mass*object.density*massMultiplier) / (4/3*Math.PI)
			);
			
			return radius;
		}

		function objectConstructor(object){

			// Coords
			this.x = object.x;
			this.y = object.y;

			// Velocity
			this.velX = object.velX;
			this.velY = object.velY;

			// Delta velocity (start at zero)
			this.deltaVelX = 0;
			this.deltaVelY = 0;

			// Mass
			this.mass = object.mass

			// Density, defaults to 1 if undefined
			this.density = object.density !== undefined ? object.density : 1;

			// Path, starts empty
			this.path = object.path !== undefined ? object.path : [];

			// Camera focus, defaults: false
			this.cameraFocus = object.cameraFocus !== undefined ? object.cameraFocus : false;
		}

		function addObject(object){
			var newObject = new objectConstructor(object);

			spacetime.push(newObject);
		}

		// Takes in two objects, joins them if they're within eachothers radius
		function joinObjects(objectA, objectB){
			if (
				getObjectDistance(objectA, objectB) < getObjectRadius(objectA) + getObjectRadius(objectB)
			){
				// Splice the objects from spacetime
				spacetime = _.without(spacetime, objectA);
				spacetime = _.without(spacetime, objectB);

				// Check if camera is focused on either object, if so the camera will be focused on this new object
				var cameraFocus = false;
				if(objectA.cameraFocus === true || objectB.cameraFocus === true){
					cameraFocus = true;
				}

				// New mass
				var mass = objectA.mass + objectB.mass;

				// Coords
				var x = objectA.x*objectA.mass/mass + objectB.x*objectB.mass/mass;
				var y = objectA.y*objectA.mass/mass + objectB.y*objectB.mass/mass;

				// Velocity
				var velX = objectA.velX*objectA.mass/mass + objectB.velX*objectB.mass/mass;
				var velY = objectA.velY*objectA.mass/mass + objectB.velY*objectB.mass/mass;

				// New density calculated from both objects mass and density
				var density = objectA.density*objectA.mass/mass+
							  objectB.density*objectB.mass/mass;

				// New path is a copy of the larger object's path
				var path = objectA.mass >= objectB.mass ? objectA.path : objectB.path;

				// Construct new object and add to spacetime
				var newObject = new objectConstructor({
					cameraFocus: 	cameraFocus,
					x: 				x,
					y: 				y,
					velX: 			velX,
					velY: 			velY,
					mass: 			mass, 
					density: 		density,
					path: 			path
				});

				addObject(newObject);

				return true;
			}
			else {
				return false;
			};
		}

		// Loops through all objects and calculates the delta velocity from gravitational forces
		function calculateObjectForce(){
			for (var a = spacetime.length - 1; a >= 0; a--) {
				var objectA = spacetime[a];

				// Calculate forces applied to objects
				for (var b = spacetime.length - 1; b >= 0; b--) {
					if (b !== a) {
						var objectB = spacetime[b];

						// getObjectDistance
						var distance = getObjectDistance(objectA, objectB);
						
						// Find angle from vector. Fun note, if we reverse objectA and B we have anti-gravity
						var angleToMass = Math.atan2(
							objectB.y-objectA.y,
							objectB.x-objectA.x
						);

						// All credit for this formula goes to an Isaac Newton
						objectA.deltaVelX += (
							Math.cos(angleToMass) *
							(objectB.mass/Math.pow(distance,2))
						);
						objectA.deltaVelY += (
							Math.sin(angleToMass) *
							(objectB.mass/Math.pow(distance,2))
						);
					};
				};
			};
		}

		// Loops through all objects and applies the force delta to the velocity
		function applyObjectForce(){
			for (var i = 0; i < spacetime.length; i++) {
				var object = spacetime[i];

				// add coords to object path
				object.path.push({
					x: object.x,
					y: object.y
				});

				// Limit path length
				if (object.path.length > Math.min(120, getObjectRadius(object) * 20 / getVelocity(object))) {
					object.path.splice(0, 1);
				};
				
				object.velX += object.deltaVelX * calculationSpeed;
				object.velY += object.deltaVelY * calculationSpeed;
				
				object.x += object.velX * calculationSpeed;
				object.y += object.velY * calculationSpeed;

				// Reset object delta velocity
				object.deltaVelX = 0;
				object.deltaVelY = 0;
			};
		}

	// ----------
	// | Public |
	// ----------

		var api = {};

		// Initialize the api, call this before using
		api.initialize = function(p_massMultiplier){
			massMultiplier = p_massMultiplier;
		}

		// ------------------------
		// | Calculation settings |
		// ------------------------
		
			api.calculationsPerSec = function(number){
				calculationsPerSec = number;
			}

			api.calculationSpeed = function(number){
				calculationSpeed = number;
			}

			api.updateMassMultiplier = function(p_massMultiplier){
				massMultiplier = p_massMultiplier;
			}

			api.startLoop = function(){
				var self = this;

				spacetimeLoop = setInterval(function(){
					self.calculateForces();
				}, 1000/calculationsPerSec);
			}

			api.stopLoop = function(){
				clearInterval(spacetimeLoop);
			}
			
		// ------------------------
		// | Spacetime object api |
		// ------------------------

			api.addObject = function(object){
				addObject(object);
			}

			api.getFocusedObject = function () {
				var flagFocused = false;
				var i;
				for (i = 0; i < spacetime.length; i++) {
					if (spacetime[i].cameraFocus === true){
						flagFocused = true;
						break;
					}
				};
				if (flagFocused)
					return spacetime[i];
				else if (spacetime.length != 0) {
					api.cycleFocus();
					return spacetime[0];
				}
				else
					return false;
			}

			api.clearSpacetime = function(){
				spacetime = [];
			}

			api.cycleFocus = function(direction){ //direction: whether forwards or backwards in array. True for next, false for previous
				var objectFound = false;

				for (var i = 0; i < spacetime.length; i++) {
					if(spacetime[i].cameraFocus !== undefined && spacetime[i].cameraFocus === true){
						
						spacetime[i].cameraFocus = false;
						spacetime[((i + spacetime.length + ((direction) ? 1 : -1))%spacetime.length)].cameraFocus = true;
						objectFound = true;

						break;
					}
				};

				if (objectFound !== true && spacetime.length > 0) {
					spacetime[0].cameraFocus = true;
				};
			}

			api.getSpace = function(){
				return spacetime;
			}

			api.calculateForces = function(){
				var self = this;

				// -----------------------------------------
				// | Find clustering objects and join them |
				// -----------------------------------------
				function recursivelyJoinClusteringObjects(){
					for (var a = spacetime.length - 1; a >= 0; a--) {
						var objectA = spacetime[a];

						for (var b = spacetime.length - 1; b >= 0; b--) {
							if (a !== b) {
								var objectB = spacetime[b];

								var joined = joinObjects(objectA, objectB);

								if (joined === true) {
									return recursivelyJoinClusteringObjects();
								};
							};
						};
					};
				}

				recursivelyJoinClusteringObjects();

				// ----------------------------------------
				// | Newtons law of universal gravitation |
				// ----------------------------------------

				// Calculate gravitational forces between all objects
				calculateObjectForce();

				// Apply delta velocity to all objects
				applyObjectForce();
			}

		return api;

});
