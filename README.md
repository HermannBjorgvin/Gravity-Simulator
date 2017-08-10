## Want to help out or modify this project?
Submit a pull request and it will likely get accepted!

## How is the code structured?
I used the AMD module system to build the application, specifically I use require.js for a module loader

There are three seperate modules

### js/gravity/spacetime.js
A module that stores all objects and performs calculations on those objects at a set speed and accuracy.

### js/gravity/branes-hut.js
There's a separate branched called 'barnes-hut' which has an implementation of the barnes-hut algorithm. Supposed to be a plug and play thing where you can toggle it for greater speeds

### js/gravity/new_render.js
The old gui and render modules have been scrapped for a new combined one that doesn't have the same annoying problem of shared state of things like the cursor or camera. Currently being worked on, sorry for any annoyance
