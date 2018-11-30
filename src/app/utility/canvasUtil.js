// canvas utility for various tasks I tend to do often
let canvas = undefined;

function resizeHandler(){
  canvas.height = canvas.offsetHeight;
  canvas.width = canvas.offsetWidth;
}

let api = {
  initialize: function(p_canvas) {
    canvas = p_canvas;
  },
  autoResize: function() {
    window.onresize = function(){
      resizeHandler();
    };
    resizeHandler();
  }
}

module.exports = api;
