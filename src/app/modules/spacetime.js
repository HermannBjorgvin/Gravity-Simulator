/*
  src/app/modules/spacetime.js
  This module handles physics calculations

  A few terms that may help
    * Solid, what I am calling the stars and planets
    * Spacetime, the Array that contains all the solids
*/

import _ from 'underscore';

class Solid {
  constructor(options = {}){
    // default options
    Object.assign(this, {
      x: 0,
      y: 0,
      velX: 0,
      velY: 0,
      deltaVelX: 0,
      deltaVelY: 0,
      mass: 1,
      density: 1,
      path: [],
      cameraFocus: false
    }, options)
  }
}

// Export spacetime class
export default class Spacetime {
  spacetime = [];
  spacetimeLoop = null;

  // Constructor with default options
  constructor(options = {}){
    Object.assign(this, {
      drawPath: true,
      showGrid: true,
      zoom: 1,
      massMultiplier: 1,
      calculationSpeed: 1,
      calculationsPerSec: 100
    }, options);

    this.startLoop();
  }

  math = {
    pythagorean: (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2)),

    getVelocity: x => this.math.pythagorean(x.velX, x.velY),
    getMomentum: a => this.math.pythagorean(a.velX, a.velY) * a.mass,
    getObjectDistance: (a, b) => this.math.pythagorean(a.x - b.x, a.y - b.y),

    getObjectRadius: x => Math.cbrt(x.mass*x.density*this.massMultiplier / 4/3*Math.PI),
    objectsAreOverlapping: (a, b) => this.math.getObjectDistance(a, b) < this.math.getObjectRadius(a) + this.math.getObjectRadius(b)
  };

  addObject(options){ this.spacetime.push(new Solid(options)); }

  // Takes in two objects, joins them if they're within eachothers radius
  joinObjects(objectA, objectB){
    if (this.math.objectsAreOverlapping(objectA, objectB)){
      // Splice the objects from spacetime
      this.spacetime = _.without(this.spacetime, objectA);
      this.spacetime = _.without(this.spacetime, objectB);

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
      var density = objectA.density*objectA.mass/mass+ objectB.density*objectB.mass/mass;

      // New path is a copy of the larger object's path
      var path = objectA.mass >= objectB.mass ? objectA.path : objectB.path;

      // Construct new object and add to spacetime
      var newObject = new Solid({
        cameraFocus:  cameraFocus,
        x:        x,
        y:        y,
        velX:       velX,
        velY:       velY,
        mass:       mass,
        density:    density,
        path:       path
      });

      this.addObject(newObject);

      return true;
    }
    else {
      return false;
    }
  }

  /*
    Iterate over solids in the spacetime Array and calculate their velocity.
    This updates the deltaVel properties which will update at the end of the cycle.
  */
  calculateObjectForce(){
    for (let a = this.spacetime.length - 1; a >= 0; a--) {
      let objectA = this.spacetime[a];

      for (let b = this.spacetime.length - 1; b >= 0; b--) {
        if (b === a ) continue;

        let objectB = this.spacetime[b];
        let distance = this.math.getObjectDistance(objectA, objectB);

        // Find angle from vector. Fun note: if we reverse the objects we get anti-gravity
        let angleToMass = Math.atan2(
          objectB.y - objectA.y,
          objectB.x - objectA.x
        );

        // All credit for this formula goes to Isaac Newton
        objectA.deltaVelX += Math.cos(angleToMass) * objectB.mass/Math.pow(distance,2);
        objectA.deltaVelY += Math.sin(angleToMass) * objectB.mass/Math.pow(distance,2);
      }
    }
  }

  // Loops through all objects and applies the force delta to the velocity
  applyObjectForce(){
    for (let i = 0; i < this.spacetime.length; i++) {
      let object = this.spacetime[i];

      // add coords to object path
      object.path.push({
        x: object.x,
        y: object.y
      });

      // Limit path length
      if (object.path.length > Math.min(120, this.math.getObjectRadius(object) * 20 / this.math.getVelocity(object))) {
        object.path.splice(0, 1);
      }

      object.velX += object.deltaVelX * this.calculationSpeed;
      object.velY += object.deltaVelY * this.calculationSpeed;

      object.x += object.velX * this.calculationSpeed;
      object.y += object.velY * this.calculationSpeed;

      // Reset object delta velocity
      object.deltaVelX = 0;
      object.deltaVelY = 0;
    }
  }

  startLoop(){
    this.spacetimeLoop = setInterval(() => {
      this.calculateForces();
    }, 1000/this.calculationsPerSec);
  }

  getSpace(){
    return this.spacetime;
  }

  calculateForces(){

    // -----------------------------------------
    // | Find clustering objects and join them |
    // -----------------------------------------

    const recursivelyJoinClusteringObjects = () => {
      for (var a = this.spacetime.length - 1; a >= 0; a--) {
        var objectA = this.spacetime[a];

        for (var b = this.spacetime.length - 1; b >= 0; b--) {
          if (a !== b) {
            var objectB = this.spacetime[b];

            var joined = this.joinObjects(objectA, objectB);

            if (joined === true) {
              return recursivelyJoinClusteringObjects();
            }
          }
        }
      }
    }

    recursivelyJoinClusteringObjects();

    // ----------------------------------------
    // | Newtons law of universal gravitation |
    // ----------------------------------------

    // Calculate gravitational forces between all objects
    this.calculateObjectForce();

    // Apply delta velocity to all objects
    this.applyObjectForce();
  }

  stopLoop(){
    clearInterval(this.spacetimeLoop);
  }

}
