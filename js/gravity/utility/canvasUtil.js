// canvas utility for various tasks I tend to do often

define([
	'jquery',
	'underscore'
], function($, _){
	
	/**************
		Private
	**************/

	var canvas = undefined;
    
    function resizeHandler(){
        canvas.height = canvas.offsetHeight;
        canvas.width = canvas.offsetWidth;
    }

	/*************
		Public
	*************/

	var publicApi = {};

	publicApi.initialize = function(p_canvas){
		canvas = p_canvas;
	}

	publicApi.autoResize = function(){
	    window.onresize = function(){
	    	resizeHandler();
	    };
	    resizeHandler();
	}

	return publicApi;

});
