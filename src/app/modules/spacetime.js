/*
  src/app/modules/spacetime.js
  This module handles physics calculations

  A few terms that may help
    * Solid, what I am calling the stars and planets
    * Spacetime, the Array that contains all the solids
*/

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
      // Calculate gravitational forces between all objects
      this.calculateObjectForce();

      // Apply delta velocity to all objects
      this.applyObjectForce();
    }, 1000/this.calculationsPerSec);
  }
  getSpace(){
    return this.spacetime;
  }
  addObject(options){ this.spacetime.push(new Solid(options)); }
  stopLoop(){
    clearInterval(this.spacetimeLoop);
  }
}
