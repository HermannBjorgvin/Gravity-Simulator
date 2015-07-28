// modules/barnes-hut

// ----------------------------------------------------
// | A barnes-hut implementation of the spacetime API |
// | Features amazing speed improvements			  |
// ----------------------------------------------------

define([
	'underscore'
],
function(
	_
){

	// -----------
	// | Private |
	// -----------

	var loop,
		tree,
		canvas,
		ctx;

	// Takes in array of objects and returns the mass and center of gravity
	function centerOfGravity(array){
		var y = 0;
		var x = 0;
		var mass = 0;

		// Find total mass first
		for (var i = array.length - 1; i >= 0; i--) {
			mass += array[i].mass;
		};

		// Calculate x, y center of gravity
		for (var i = array.length - 1; i >= 0; i--) {
			x = array[i].x * array[i].mass/mass;
			y = array[i].y * array[i].mass/mass;
		};

		return {
			x: x,
			y: y,
			mass: mass
		}
	}

	function nodeConstructor(x, y, width, height, depth){
		this.x = x;
		this.y = y;
		this.width = width;
		this.height = height;

		this.depth = depth; // How far down the tree this branch is
		this.nodes = [];

		// Body, will be undefined if none, if more than one split node and so on
		this.body = undefined;

		// For debugging
		// this.color = depthColor(this.depth);
		this.color = randColor(0.2);

		this.split = function(){
			// top nodes
			for (var i = 0; i < 2; i++) {
				var node = new nodeConstructor(
					this.x + this.width/2 * i,
					this.y,
					this.width/2,
					this.height/2,
					this.depth+1
				);
				this.nodes.push(node);
			};
			// bottom nodes
			for (var i = 0; i < 2; i++) {
				var node = new nodeConstructor(
					this.x + this.width/2 * i,
					this.y + this.height/2,
					this.width/2,
					this.height/2,
					this.depth+1
				);
				this.nodes.push(node);
			};
		}
	}

	function createTree(){
		tree = new nodeConstructor(0, 0, 512, 512, 0);
	}

	function walkNodes(node, callback){
		callback(node);

		var children = node.nodes;
		for (var i = 0; i < children.length; i++) {
			walkNodes(children[i], callback);
		};	
	}

	function startLoop(){
		var lim = 0;
		loop = setInterval(function(){
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.beginPath();

			walkNodes(tree, function(node){
				ctx.fillStyle = node.color;
				ctx.fillRect(node.x, node.y, node.width, node.height);

				if (lim <= 1024 && node.depth < 7 && node.nodes.length === 0 && Math.random() < 0.1) {
					lim++;
					node.split();
				};
				// console.log("walk hard");
			});

		}, 100);

		walkNodes(tree, function(node){

		});
	}

	function randColor(opacity){
		return 'rgba('+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+Math.floor(Math.random()*255)+','+ opacity +')';
	}

	function depthColor(depth){
		return 'rgba('+Math.floor(255 - 255/10*depth)+','+Math.floor(255 - 255/10*depth)+','+Math.floor(255 - 255/10*depth)+','+ 0.3 +')';
	}

	function divideNode(){

	}

	function joinNodes(){

	}

	// ----------
	// | Public |
	// ----------

	var api = {};
	
	api.initialize = function(p_canvas){
		canvas = p_canvas;
		ctx = canvas.getContext('2d');

		createTree();
		startLoop();
	};

	return api;
});
