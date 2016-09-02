// modules/gui
// handles user input between spacetime and renderer

define([
	'jquery',
	'underscore'
], function ($, _) {

	/**************
		Private
	**************/

	var spacetime = undefined;
	var render = undefined;
	var canvas = undefined;
	var massMultiplier = undefined; // How exagerrated the size of the objects are (humans like that)

	var mouse = {
		visible: true
	};

	/*************
		Public
	*************/

	var guiApi = {};
	var menuCustomMass, menuShowGrid;

	guiApi.initialize = function (p_spacetime, p_render, p_canvas, p_massMultiplier) {
		spacetime = p_spacetime;
		render = p_render;
		canvas = p_canvas;
		massMultiplier = p_massMultiplier;
	}

	return guiApi;

});
