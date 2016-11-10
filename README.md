shared-state-client
===================

This repository contains the JavaScript client components from the MediaScape SharedState library in a form that can be readily imported for use in browsers and node.js.

Build Instructions
------------------

Type:

`npm install`

Then type:

`make all`

This will create a dist folder containing a browserfied/minified/babelified library and corresponding source map for the browser and a non-browserified set of source files for use by node.js require().

