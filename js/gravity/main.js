// main

// config
require.config({
	basePath: 'js/gravity',
	paths:{
		jquery: '../vendor/jquery-1.11.2.min',
		underscore: '../vendor/underscore-min',
		hammer: '../vendor/hammer-time.min.js'
	}
});

// start gravity simulation
require(['app'], function(App){
	App.initialize('gravity');
});
