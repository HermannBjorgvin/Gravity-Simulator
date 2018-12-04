// modules/render

import $ from 'jquery';

var spacetime = undefined;
var canvas = undefined;
var ctx = undefined;
var renderLoop = undefined;
var fps = 60;
var massMultiplier = undefined;
var camera = {
  x: 0,
  y: 0,
  zoom: 1,
  targetX: 0,
  targetY: 0,
  targetZoom: 1,
  inputX: 0,
  inputY: 0,
  inputZoom: 1,
  getX(p_x){ return (p_x*this.zoom - this.x*this.zoom) },
  getY(p_y){ return (p_y*this.zoom - this.y*this.zoom) },
  getMouseX(p_x){ return this.x + p_x/this.zoom },
  getMouseY(p_y){ return this.y + p_y/this.zoom }
};
var settings = {
  showGrid: true,
  drawPath: true
}

function clearCanvas(){
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
}

/*
  Move the camera naturally to the target X and Y coordinates
*/
function alignCamera(){
  camera.x = camera.targetX - camera.inputX;
  camera.y = camera.targetY - camera.inputY;
  camera.zoom = camera.targetZoom;
}

function renderObject(object){
  // --------------------
  // | Draw object path |
  // --------------------
  if (settings.drawPath) {
    if (object.path.length > 3) {
      ctx.beginPath();
      ctx.moveTo(
        camera.getX(object.path[0].x),
        camera.getY(object.path[0].y)
      );

      for (let i = 1; i < object.path.length - 2; i++) {
        let xc = (object.path[i].x + object.path[i + 1].x) / 2;
        let yc = (object.path[i].y + object.path[i + 1].y) / 2;

        ctx.quadraticCurveTo(
          camera.getX(object.path[i].x),
          camera.getY(object.path[i].y),
          camera.getX(xc),
          camera.getY(yc)
        );
      }

      // curve through the last two points
      ctx.quadraticCurveTo(
        camera.getX(object.path[object.path.length - 2].x),
        camera.getY(object.path[object.path.length - 2].y),
        camera.getX(object.path[object.path.length - 1].x),
        camera.getY(object.path[object.path.length - 1].y)
      );

      ctx.lineWidth = 1;
      ctx.strokeStyle = "#666";
      ctx.stroke();
    }
  }

  // ---------------
  // | Draw object |
  // ---------------
  var radius = Math.cbrt(object.mass*object.density*massMultiplier / 4/3*Math.PI);
  radius = Math.max(radius, 1);

  ctx.beginPath();
  ctx.arc(
    camera.getX(object.x),
    camera.getY(object.y),
    radius*camera.zoom,
    0,
    2 * Math.PI,
    false
  );

  ctx.strokeStyle = "#666";
  ctx.fillStyle = "#000";
  if (object.cameraFocus === true) ctx.fillStyle = '#40A2BF';
  ctx.fill();
}

/* Renders grid accoding to grid size and camera position and zoom */
function renderGrid(spacing, color){
  var gridSize = spacing * camera.zoom;
  var gridWidth = Math.ceil(canvas.width/gridSize)+2;
  var gridHeight = Math.ceil(canvas.height/gridSize)+2;

  for (let i = gridWidth - 1; i >= 0; i--) {
    ctx.beginPath();

    ctx.moveTo(
      i*gridSize - camera.x*camera.zoom%gridSize,
      0
    );
    ctx.lineTo(
      i*gridSize - camera.x*camera.zoom%gridSize,
      canvas.height
    );

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  for (let i = gridHeight - 1; i >= 0; i--) {
    ctx.beginPath();

    ctx.moveTo(
      0,
      i*gridSize - camera.y*camera.zoom%gridSize
    );
    ctx.lineTo(
      canvas.width,
      i*gridSize - camera.y*camera.zoom%gridSize
    );

    ctx.strokeStyle = color;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function renderFrame(spacetime){
  clearCanvas();
  alignCamera();

  if (settings.showGrid === true) {
    renderGrid(50, "#CCC");
  }

  for (var i = spacetime.length - 1; i >= 0; i--) {
    renderObject(spacetime[i]);
  }
}

export default {
  initialize(el, p_spacetime, options){
    canvas = el;
    ctx = canvas.getContext('2d');
    spacetime = p_spacetime;
    massMultiplier = options.massMultiplier;
    this.changeZoom(options.zoom);

    // Disable canvas context menu
    $('body').on('contextmenu', canvas, function(){ return false; });

    this.startLoop();
  },
  startLoop(){
    renderLoop = setInterval(function(){
      renderFrame(spacetime.getSpace());
    }, 1000/fps);
  },
  stopLoop(){
    clearInterval(renderLoop);
  },
  setDrawGrid(value){
    settings.showGrid = value;
  },
  changeZoom(zoom) {
      camera.targetZoom = zoom;
  },
  touchHandler(e){
    console.log(e.type);
    if (e.type === 'pan') {
      let x = e.deltaX;
      let y = e.deltaY;

      // console.log(`dX: ${x}, dY: ${y}`);

      camera.inputX = x;
      camera.inputY = y;
    }
    else if (e.type === 'panend') {
      camera.targetX -= camera.inputX;
      camera.targetY -= camera.inputY;

      camera.inputX = 0;
      camera.inputY = 0;
    }

    if (e.type == "pinch") {
        camera.inputZoom = Math.max(1, Math.min(camera.targetZoom * (e.scale), 4));
    }
    if(e.type == "pinchend"){ camera.targetZoom = camera.inputZoom;}

  },
  setDrawPath (value) {
      settings.drawPath = value;
  }
}
