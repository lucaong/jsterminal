JSterminal
==========

One bookmarklet to rule 'em all. JSterminal is a bookmarklet that, when clicked, opens up a terminal-like interface that offers many useful commands. For example, here are some of the commands available by default:

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

Creating Your Own Commands
==========================

With some basic JavaScript knowledge it's easy to write custom commands. To make a new custom command available in JSterminal you need to call the `JSterminal.register()` function. The function accepts two arguments:

* the name of the command (the one you will use to invoke it)
* an object defining the command implementation and other info. In particular, this object should contain the following properties:
  - `execute`: a callable function implementing the command logic. When the command is invoked, JSterminal calls this function passing the array of command-line arguments and an object containing the option set via command line.
  - `description`: a short description of the command
  - `help`: a longer text describing the command, its usage, and providing help (used by the `help` command)
  - `options`: an object describing the command-line options and flags available for this command. For each option you can optionally specify whether it accepts arguments, a short description and an alias.

An example is worth a thousand words:

```javascript
JSterminal.register("s", {
  
  // Short description
  description: "search on Google",
  
  // Help text
  help: "it searches the string passed as argument on Google\nSynopsis:\n  s SEARCH_QUERY",
  
  // Command line options
  options: {
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
  }
  
});
```

Input/Output API
----------------

In the `execute` function, you can get input and print output on the terminal making use of the API. JSterminal assign to each command an `io` object, which represents an Input/Output interface. Its methods make it possible to reserve control of the input/output, to read user input and to write output to the terminal:

`io.reserve()`
  reserve control of the input/output. Always make sure you call this method before starting to make input/output requests with `io.puts(...)` or `io.gets(...)`.

`io.checkout()`
  release control of the input/output. If you reserved it with `io.reserve()`, don't forget to release it with `io.checkout()` when you are done, or subsequent command calls won't be able to read/write.

`io.puts(outputString, [callback(outputString)], [options])`
  asynchronously writes `outputString` in the terminal, followed by a new line, and, once done, calls the `callback` function passing `outputString`.

`io.gets([callback(inputString)], [options])`
  asynchronously gets input from the user. Once the input is received, calls the `callback` function passing the input string.

As an example, see this 'hello' command:

```javascript
JSterminal.register("hello", {
  description: "says hello",
  help: "prompts the user for his/her name and then print 'Hello, <name>!'",
  execute: function() {
    var io = this.io;
    io.reserve(); // Reserve control of input/output
    io.puts("What's your name?", function() {
      io.gets(function(name) {
        io.puts("Hello, "+name+"!", function() {
          io.checkout(); // Release control of input/output
        });
      });
    });
  }
});
```

If you take on the challenge to write your own commands, code them at the bottom of `src/commands.js` and re-build JSterminal. Should you come up with some cool new commands, don't forget to send me a pull request.


Build Instructions
==================

    make clean
    make

The built version will be put in the `dist` subfolder.

To try out JSterminal, place the distribution files (`index.html` and `jsterminal.js`) in a location accessible from your browser. Then, in the file `index.html`, substitute the path `http://localhost:8888/jsterminal/dist/jsterminal.js` with the correct absolute path to `jsterminal.js` on your local machine or server. Finally, open `index.html` in your browser and drag the link in your bookmarks bar.


Minified version
----------------

To produce a minified version, you should make sure you have Node.js and UglifyJS installed. Then run

    make minify

The result will be placed in `dist/jsterminal.min.js`


Run the Tests
=============

To run the test suite, just open `test/index.html` in your browser.