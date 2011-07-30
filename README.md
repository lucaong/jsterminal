Build Instructions
==================

    make clean
    make

The built version will be put in the `dist` subfolder.
To try it out, substitute in the file `index.html` the path `http://localhost:8888/jsterminal/dist/jsterminal.js` with the correct absolute path to `jsterminal.js` on your local machine or server, then open `index.html` in your browser.


Minified version
----------------

To produce a minified version, you should make sure you have Node.js and UglifyJS installed. Then run

    make minify

The result will be placed in `dist/jsterminal.min.js`


Run the Tests
=============

To run the test suite, just open `test/index.html` in your browser.