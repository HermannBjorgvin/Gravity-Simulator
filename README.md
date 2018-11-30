# 2018 Refactor
I have set a goal to refactor this application in 2018-2019. I want this application to be highly usable on desktops, tablets, and mobile devices, with a user interface that adapts to the device but lets desktop users still be able to use the more complicated toolset.

The first issue to resolve is migrating to VueJS and a ES6 module system.

Goals for the refactor
 * new much improved Desktop/tablet/phone ui
 * touch input support
 * new logo
 * Dark/light theme
 * Webassembly barnes hutt algorithm implementation

## How is the code structured?
I used the AMD module system to build the application, specifically I use require.js for a module loader

There are three seperate modules

### js/gravity/spacetime.js
A module that stores all objects and performs calculations on those objects at a set speed and accuracy.

### js/gravity/branes-hut.js
There's a separate branched called 'barnes-hut' which has an implementation of the barnes-hut algorithm. Supposed to be a plug and play thing where you can toggle it for greater speeds

### js/gravity/new_render.js
The old gui and render modules have been scrapped for a new combined one that doesn't have the same annoying problem of shared state of things like the cursor or camera. Currently being worked on, sorry for any annoyance
