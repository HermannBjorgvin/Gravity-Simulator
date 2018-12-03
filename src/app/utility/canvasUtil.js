// canvas utility for various tasks I tend to do often

function resizeHandler(canvas){
  canvas.height = canvas.offsetHeight;
  canvas.width = canvas.offsetWidth;
}

let api = {
  autoResize: function(p_canvas) {
    let canvas = p_canvas;
    window.onresize = function(){
      resizeHandler(canvas);
    };
    resizeHandler(canvas);
  }
}

module.exports = api;
