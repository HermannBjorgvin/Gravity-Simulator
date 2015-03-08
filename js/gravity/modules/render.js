// render

define(['jquery', 'underscore'], function($, _){
	
	/**************
		Private
	**************/

	var canvas = undefined;
	var ctx = undefined;

	var renderLoop;
	var fps = 30;
	var zoom = 10;

	var clearCanvas = function(){
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.beginPath();
	}

	/*************
		Public
	*************/

	var renderApi = {};

	renderApi.initialize = function(p_canvas){
		canvas = p_canvas;
		ctx = canvas.getContext('2d');
	}

	renderApi.startLoop = function(p_spacetime){
		var self = this;
		var spacetime = p_spacetime;

		renderLoop = setInterval(function(){
			self.renderFrame(spacetime.getSpace());
		}, 1000/fps);
	}

	renderApi.renderFrame = function(spacetime){
		clearCanvas();
		for (var i = spacetime.length - 1; i >= 0; i--) {
			var object = spacetime[i];

			var radius = Math.pow(3*(object.mass/4*Math.PI), (1/3));

			ctx.beginPath();
			ctx.arc(object.x, object.y, radius * zoom, 0, 2 * Math.PI, false);
			ctx.fillStyle = '#AAA';
			ctx.fill();
		};
	}

	return renderApi;

})
