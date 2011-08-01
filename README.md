JSterminal
==========

One bookmarklet to rule 'em all. JSterminal is a bookmarklet that, when clicked, opens up a terminal-like interface that offers many useful commands (e.g. the command 'tr' will translate the current page, while 'w' will look for a definition on Wikipedia).

With some basic JavaScript knowledge it's easy to write custom commands. To add a custom command you have to call the `JSterminal.register(commandName, objectDefiningCommandLogicAndInfo)` function. An example is worth a thousand words:

    JSterminal.register("s", {
      description: "search on Google", // Short description
      help: "it searches the string passed as argument on Google\nSynopsis:\n  s SEARCH_QUERY",  // Longer description
      // Command line options
      options: {
        "-d": {
          argument: true, // true if the option expects an argument, false if it is just a flag
          description: "top level domain to use (e.g. 'com', 'de' or 'it'). Default is 'com'.",
          alias: "--domain"
        }
      },
      // The execute method must always be present. It is called and passed arguments and options when the command is invoked.
      execute: function(argv, options) {
        window.open("http://www.google."+(options["-d"] || "com")+"/search?q="+argv.join("+"));
      }
    });

If you feel like to take on the challenge to write your own commands, code them at the bottom of `src/commands.js` and re-build it. If you come up with some cool new commands, don't forget to send me a pull request.


Build Instructions
==================

    make clean
    make

The built version will be put in the `dist` subfolder.
To try it out, place the distribution files (`index.html` and `jsterminal.js`) in a location accessible via your browser. Then, in the file `index.html`, substitute the path `http://localhost:8888/jsterminal/dist/jsterminal.js` with the correct absolute path to `jsterminal.js` on your local machine or server. Finally, open `index.html` in your browser and drag the link in your bookmarks bar.


Minified version
----------------

To produce a minified version, you should make sure you have Node.js and UglifyJS installed. Then run

    make minify

The result will be placed in `dist/jsterminal.min.js`


Run the Tests
=============

To run the test suite, just open `test/index.html` in your browser.