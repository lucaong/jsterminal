JSterminal
==========

One bookmarklet to rule 'em all. JSterminal is a bookmarklet that, when clicked, opens up a terminal-like interface that offers many useful commands. For example, here are some of the available commands:

    css: CSS console to add/edit page style
    def: search for a definition
    deli: bookmark page on Delicious
    enit: English to Italian translation
    exit: exit JSterminal
    gmail: send link by email using Gmail
    help: provides some help
    img: search on Google Image Search
    iten: Italian to English translation
    js: JavaScript console
    mail: send link by email
    map: search on Google Maps
    s: search on Google
    tr: translate page with Google Translate
    tube: search on YouTube
    tweet: share on Twitter
    w: search on Wikipedia

With some basic JavaScript knowledge it's easy to write custom commands. To add a custom command you have to call the `JSterminal.register(commandName, objectDefiningCommandLogicAndInfo)` function. An example is worth a thousand words:

    JSterminal.register("s", {
      description: "search on Google", // Short description
      help: "it searches the string passed as argument on Google\nSynopsis:\n  s SEARCH_QUERY",  // Help text
      options: { // Command line options
        "-d": {
          argument: true, // true if the option expects an argument, false if it is just a flag
          description: "top level domain to use (e.g. 'com', 'de' or 'it'). Default is 'com'.", // Option description
          alias: "--domain" // Option alias
        }
      },
      // The execute function is the only mandatory property. When a command is invoked, JSterminal calls its execute() function
      // passing an array of command-line arguments and a key-value object containing command-line options set in the invocation.
      execute: function(argv, options) {
        window.open("http://www.google."+(options["-d"] || "com")+"/search?q="+argv.join("+"));
        this.io.exit(); // Don't forget to call this.io.exit() at the end of your command
      }
    });

If you take on the challenge to write your own commands, code them at the bottom of `src/commands.js` and re-build JSterminal. Should you come up with some cool new commands, don't forget to send me a pull request.


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