<h3>Want to help out or modify this project?</h3>
Submit a pull request and it will likely get accepted!

##How is the code structured?
I used the AMD module system to build the application, specifically I use require.js for a module loader

There are three seperate modules

### js/gravity/spacetime.js
A module that stores all objects and performs calculations on those objects at a set speed and accuracy.

### js/gravity/branes-hut.js
There's a separate branched called 'barnes-hut' which has an implementation of the barnes-hut algorithm. Supposed to be a plug and play thing where you can toggle it for greater speeds

### js/gravity/render.js
A module that handles rendering the spacetime array to the canvas, also handles rendering GUI interactions like placing objects.

### js/gravity/gui.js
Avoid at all cost, this is an older module that was meant to be temporary, going to rewrite this, in the meanwhile it poses a mental health risk to everyone who touches it.

