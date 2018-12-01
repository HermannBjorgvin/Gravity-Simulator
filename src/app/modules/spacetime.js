/*
  src/app/modules/spacetime.js
  This module handles physics calculations

  A few terms that may help
    * Solid, what I am calling the stars and planets
    * Spacetime, the Array that contains all the solids
*/

import _ from 'underscore';

// Spacetime, array that stores all objects
var spacetime = [];

// Settings
var calculationsPerSec  = 100;  // How many gravitational calculations are performed a second
var calculationSpeed  = 1;  // Speed comes at the cost of accuracy
var massMultiplier;       // How exagurated the size of the objects are (human readable)

// Calculation setInterval loop
var spacetimeLoop;

/*var debugLoop = setInterval(function(){
  var totalMass = 0;

  for (var i = 0; i < spacetime.length; i++) {
    totalMass += spacetime[i].mass;
  }
}, 1000);*/

const pythagorean = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

const getObjectDistance = (a, b) => pythagorean(a.x - b.x, a.y - b.y);
const getVelocity = x => pythagorean(x.velX, x.velY);
// const getMomentum = a => pythagorean(a.velX, a.velY) * a.mass;

// Radius center of object
const getObjectRadius = x => Math.cbrt(x.mass*x.density*massMultiplier / 4/3*Math.PI);

// Object class
class solid {
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

function addObject(object){
  var newObject = new solid(object);

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
    var newObject = new solid({
      cameraFocus:  cameraFocus,
      x:        x,
      y:        y,
      velX:       velX,
      velY:       velY,
      mass:       mass,
      density:    density,
      path:       path
    });

    addObject(newObject);

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
function calculateObjectForce(){
  for (let a = spacetime.length - 1; a >= 0; a--) {
    let objectA = spacetime[a];

    for (let b = spacetime.length - 1; b >= 0; b--) {
      if (b === a ) continue;

      let objectB = spacetime[b];

      let distance = getObjectDistance(objectA, objectB);

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
function applyObjectForce(){
  for (let i = 0; i < spacetime.length; i++) {
    let object = spacetime[i];

    // add coords to object path
    object.path.push({
      x: object.x,
      y: object.y
    });

    // Limit path length
    if (object.path.length > Math.min(120, getObjectRadius(object) * 20 / getVelocity(object))) {
      object.path.splice(0, 1);
    }

    object.velX += object.deltaVelX * calculationSpeed;
    object.velY += object.deltaVelY * calculationSpeed;

    object.x += object.velX * calculationSpeed;
    object.y += object.velY * calculationSpeed;

    // Reset object delta velocity
    object.deltaVelX = 0;
    object.deltaVelY = 0;
  }
}

export default {
  initialize(p_massMultiplier){
    massMultiplier = p_massMultiplier;

    this.startLoop()
  },
  calculationsPerSec(number){
    calculationsPerSec = number;
  },
  calculationSpeed(number){
    calculationSpeed = number;
  },
  updateMassMultiplier(p_massMultiplier){
    massMultiplier = p_massMultiplier;
  },
  startLoop(){
    spacetimeLoop = setInterval(() => {
      this.calculateForces();
    }, 1000/calculationsPerSec);
  },
  stopLoop(){
    clearInterval(spacetimeLoop);
  },
  addObject(object){
    addObject(object);
  },
  getFocusedObject() {
    var flagFocused = false;
    var i;
    for (i = 0; i < spacetime.length; i++) {
      if (spacetime[i].cameraFocus === true){
        flagFocused = true;
        break;
      }
    }
    if (flagFocused)
      return spacetime[i];
    else if (spacetime.length != 0) {
      this.cycleFocus();
      return spacetime[0];
    }
    else
      return false;
  },
  clearSpacetime(){
    spacetime = [];
  },
  cycleFocus(direction){ //direction: whether forwards or backwards in array. True for next, false for previous
    var objectFound = false;

    for (var i = 0; i < spacetime.length; i++) {
      if(spacetime[i].cameraFocus !== undefined && spacetime[i].cameraFocus === true){

        spacetime[i].cameraFocus = false;
        spacetime[((i + spacetime.length + ((direction) ? 1 : -1))%spacetime.length)].cameraFocus = true;
        objectFound = true;

        break;
      }
    }

    if (objectFound !== true && spacetime.length > 0) {
      spacetime[0].cameraFocus = true;
    }
  },
  getSpace(){
    return spacetime;
  },
  calculateForces(){
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
    calculateObjectForce();

    // Apply delta velocity to all objects
    applyObjectForce();
  }
}
