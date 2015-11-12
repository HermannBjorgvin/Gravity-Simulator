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
    var massMultiplier = undefined; // How exaggerated the size of the objects are (humans like that)

    // Function that controls the left mouse which controls the mass builder
    /*
     States:
     placement
     mass
     velocity
     */

    var mouse = {
        visible: true,
        x: 0,
        y: 0,
        x2: 0,
        y2: 0,
        radius: 0,
        state: 'placement'
    };

    var massBuilder = function (e) {
        switch (mouse.state) {
            case 'placement':
                // This state ^
                mouse.state = 'mass';
                mouse.x2 = e.clientX;
                mouse.y2 = e.clientY;
                mouse.radius = 0;
                break;
            case 'mass':
                // This state ^
                mouse.radius = Math.sqrt(Math.pow(mouse.x - mouse.x2, 2) + Math.pow(mouse.y - mouse.y2, 2));

                if (e.type === 'mousedown') {
                    mouse.state = 'velocity';
                }

                break;
            case 'velocity':
                // This state ^

                if (e.type === 'mousedown') {
                    mouse.radius /= render.getCamera().zoom;

                    spacetime.addObject({
                        x: render.getCamera().getMouseX(mouse.x2),
                        y: render.getCamera().getMouseY(mouse.y2),
                        velX: -(mouse.x - mouse.x2) / 100,
                        velY: -(mouse.y - mouse.y2) / 100,
                        mass: (4 / 3 * Math.PI) * Math.pow(mouse.radius, 3) / massMultiplier,
                        density: 1,
                        path: []
                    });

                    // Reset state machine
                    mouse.state = 'placement';
                    mouse.radius = 0;
                }

                break;
        }
    };

    var mouseMove = function (e) {
        // console.log('x:' + e.clientX + ' y:' + e.clientY);
        mouse.x = e.clientX;
        mouse.y = e.clientY;

        if (mouse.state === 'mass' || mouse.state === 'velocity') {
            massBuilder(e);
        }


        render.setMouse(mouse);
    };

    /*************
     Public
     *************/

    var guiApi = {};

    guiApi.initialize = function (p_spacetime, p_render, p_canvas, p_massMultiplier) {
        spacetime = p_spacetime;
        render = p_render;
        canvas = p_canvas;
        massMultiplier = p_massMultiplier;

        var menu = document.getElementById('main-menu');

        var menuToggleGrid = document.getElementById('menu-toggle-grid');
        menuToggleGrid.checked = true;
        menuToggleGrid.addEventListener('change', function () {
            render.toggleGrid();
        });

        var menuToggleLockCamera = document.getElementById('menu-toggle-lock-camera');
        menuToggleLockCamera.checked = true;
        menuToggleLockCamera.addEventListener('change', function () {
            render.toggleLockCamera();
        });

        var menuToggleRealisticUiMode = document.getElementById('menu-toggle-realistic-ui-mode');
        menuToggleRealisticUiMode.checked = false;
        menuToggleRealisticUiMode.addEventListener('change', function () {

            switch (menuToggleRealisticUiMode.checked) {
                case true:
                    menu.className = "menu menu-realistic-mode";
                    break;
                case false:
                    menu.className = "menu";
                    break;
            }
            render.toggleRealisticUiMode();
        });

        var massMultiplierInput = document.getElementById('menu-mass-multiplier');
        massMultiplierInput.value = 200;
        massMultiplierInput.addEventListener('change', function () {
            massMultiplier = massMultiplierInput.value;
            render.updateMassMultiplier(massMultiplierInput.value);
            spacetime.updateMassMultiplier(massMultiplierInput.value);
        });

        var zoomInput = document.getElementById('menu-zoom');
        zoomInput.value = 1;
        zoomInput.addEventListener('change', function () {
            render.changeZoom(zoomInput.value);
        });

        var speedInput = document.getElementById('menu-speed');
        speedInput.value = 1;
        speedInput.addEventListener('change', function () {
            spacetime.calculationSpeed(speedInput.value);
        });

        var clearspacebtn = document.getElementById('menu-clear-spacetime');
        clearspacebtn.addEventListener('click', function () {
            spacetime.clearSpacetime();
        });

        var cyclefocusbtn = document.getElementById('menu-cycle-focus');
        cyclefocusbtn.addEventListener('click', function () {
            spacetime.cycleFocus();
        });

        /*
         * Instead of setting an event to be a function
         * we should always add an event listener in case
         * we want to attach more hooks on that event
         */
        canvas.addEventListener("mousedown", function (e) {
            if (e.which === 1) {
                // console.log('left mouse click');
                // console.log(spacetime.getSpace().length);
                massBuilder(e);
            }
            else if (e.which === 3) {
                //I think there is no need to the user right click
                //in here. It can confuse the user.
                return false;
                // console.log('right mouse click');
            }
        }, false);


        canvas.addEventListener("mousemove", function (e) {
            mouseMove(e);
        }, false);


        //The following adds support to control the camera zoom with mouse wheel
        canvas.addEventListener('mousewheel', function (event) {
            // cross-browser wheel delta
            var e = window.event || event; // old IE support
            //Since the value is +100 or -100 base 10, we can divide by 10 to make zoom smoother:
            var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail))) / 10;
            var zoomValue = parseFloat(zoomInput.value) + delta;
            if (zoomValue <= 0) {
                zoomValue = 0.1; //Minimum zoom value
            }
            zoomInput.value = zoomValue;
            render.changeZoom(zoomValue);
        }, false);

    };

    return guiApi;

});
