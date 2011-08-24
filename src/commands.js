// CUSTOM COMMAND REGISTRATION

JSterminal.register("tweet", {
  description: "share on Twitter",
  help: "it shares the current URL on Twitter, adding (in order of precedence) the text passed as argument or the page title in the status text",
  execute: function(argv){
    window.open("http://twitter.com/share?url="+location.href+"&text="+encodeURI(argv.join(" ") || document.title));
  }
});

JSterminal.register("s", {
  description: "search on Google",
  help: "it searches the string passed as argument on Google\nSynopsis:\n  s SEARCH_QUERY",
  options: {
    "-d": {
      argument: true,
      description: "top level domain to use (e.g. 'com', 'de' or 'it'). Default is 'com'.",
      alias: "--domain"
    }
  },
  execute: function(argv, options){
    window.open("http://www.google."+(options["-d"] || "com")+"/search?q="+argv.join("+"));
  }
});

JSterminal.register("def", {
  description: "search for a definition",
  help: "it searches the string passed as argument for a definition on Google\nSynopsis:\n  s SEARCH_QUERY",
  execute: function(argv){
    window.open("http://www.google.com/search?q=define:"+argv.join("+"));
  }
});

JSterminal.register("w", {
  options: {
    "-l": {
      argument: true,
      description: "language code (e.g. 'en' or 'it')",
      alias: "--language"
    }
  },
  description: "search on Wikipedia",
  help: "it searches the string passed as argument on Wikipedia",
  execute: function(argv, options){
    window.open("http://www.wikipedia.org/search-redirect.php?search="+argv.join("+")+"&language="+(options["-l"] || "en"));
  }
});

JSterminal.register("deli", {
  description: "bookmark page on Delicious",
  help: "it bookmarks the current page on Delicious\nSynopsis:\n  deli [TITLE] [NOTES]",
  options: {
    "-l": {
      argument: false,
      description: "open the list of saved bookmarks",
      alias: "--list"
    }
  },
  execute: function(argv, options) {
    if (!!options["-l"]) {
      window.open("http://delicious.com/home");
    } else {
      window.open("http://delicious.com/save?url="+location.href+"&title="+(argv[0] || document.title)+"&v=5&jump=yes&notes="+(argv[1]||""));
    }
  }
});

JSterminal.register("tr", {
  description: "translate page with Google Translate",
  help: "it translates the current page with Google Translate\nSynopsis:\n  tr [DESTINATION_LANGUAGE]",
  execute: function(argv){
    window.open("http://translate.google.com/translate?u="+location.href+"&tl="+(argv[0] || "en"));
  }
});

JSterminal.register("iten", {
  description: "Italian to English translation",
  help: "it translates a word or expression from Italian to English using WordReference\nSynopsis:\n  iten WORD",
  execute: function(argv){
    window.open("http://www.wordreference.com/iten/"+argv.join("+").replace(/ +/, "+"));
  }
});

JSterminal.register("enit", {
  description: "English to Italian translation",
  help: "it translates a word or expression from English to Italian using WordReference\nSynopsis:\n  enit WORD",
  execute: function(argv){
    window.open("http://www.wordreference.com/enit/"+argv.join("+").replace(/ +/, "+"));
  }
});

JSterminal.register("map", {
  description: "search on Google Maps",
  help: "it searches the string passed as argument on Google Maps\nSynopsis:\n  map SEARCH_QUERY",
  execute: function(argv){
    window.open("http://www.google.com/maps?q="+argv.join("+"));
  }
});

JSterminal.register("img", {
  description: "search on Google Image Search",
  help: "it searches the string passed as argument on Google Image Search\nSynopsis:\n  img SEARCH_QUERY",
  execute: function(argv){
    window.open("http://www.google.com/images?q="+argv.join("+"));
  }
});

JSterminal.register("tube", {
  description: "search on YouTube",
  help: "it searches the string passed as argument on YouTube\nSynopsis:\n  tube SEARCH_QUERY",
  execute: function(argv){
    window.open("http://www.youtube.com/results?search_query="+argv.join("+"));
  }
});

JSterminal.register("mail", {
  description: "send link by email",
  help: "it opens your default email application pre-filling a new email with a link to the current page\nSynopsis:\n  mail [RECIPIENTS] [SUBJECT]",
  execute: function(argv){
    window.open("mailto:"+(argv[0]||"")+"?subject="+(argv[1]||document.title)+"&body="+location.href+"%0A%0A"+argv.join("+"));
  }
});

JSterminal.register("gmail", {
  description: "send link by email using Gmail",
  help: "it opens Gmail pre-filling a new email with a link to the current page\nSynopsis:\n  gmail [RECIPIENTS] [SUBJECT]",
  execute: function(argv){
    window.open("https://mail.google.com/mail/?view=cm&tf=1&to=" + (argv[0] || "") + "&cc=&su=" + (argv[1] || document.title) + "&body=" + location.href + "&fs=1",'_blank','location=yes,menubar=yes,resizable=yes,width=800,height=600');
  }
});

JSterminal.register("css", {
  description: "CSS console to add/edit page style",
  help: "it opens a CSS console, making it possible to add CSS directive to the current page. Enter 'quit' or 'q' to quit the console.",
  io: JSterminal.IO({ prefixes: { input: "&gt;&gt; ", output: "&gt;&gt; " } }), // Store IO interface in the object, so that it survives multiple calls to execute()
  execute: function(argv){
    var $css = this;
    var io = $css.io;
    $css.cache = $css.cache || "";
    $css.addStyle = function(css) {
      if (css != 'q' && css != 'quit' && css != 'Q') {
        io.puts(css, function(css) {
          $css.cache += "\n"+css;
          if (!document.getElementById("JSterminal-css-console-style")) {
            var style = document.createElement("style");
            style.id = "JSterminal-css-console-style";
            style.type = "text/css";
            document.body.appendChild(style);
          }
          document.getElementById("JSterminal-css-console-style").innerHTML = $css.cache;
          io.gets($css.addStyle);
        });
      } else {
        io.puts("CSS console closed\n", function() {
          io.checkout();
        });
      }
    }
    io.reserve();
    io.gets($css.addStyle);
  }
});

JSterminal.register("js", {
  description: "JavaScript console",
  help: "it opens an interactive JavaScript console. Enter 'quit' or 'q' to quit the console.",
  io: JSterminal.IO({ prefixes: { input: "&gt;&gt; ", output: "&gt;&gt; " } }), // Store IO interface in the object, so that it survives multiple calls to execute()
  execute: function(argv) {
    var $js = this;
    var io = $js.io;
    $js.globalEval = (function() {
      // globalEval code by kangax http://perfectionkills.com/global-eval-what-are-the-options/
      var isIndirectEvalGlobal = (function(original, Object) {
        try {
          return (1,eval)('Object') === original;
        }
        catch(err) {
          return false;
        }
      })(Object, 123);
      if (isIndirectEvalGlobal) {
        return function(expression) {
          return (1,eval)(expression);
        };
      }
      else if (typeof window.execScript !== 'undefined') {
        return function(expression) {
          return window.execScript(expression);
        };
      }
    })();
    this.interpretJS = function(js) {
      if (js != 'q' && js != 'quit' && js != 'Q') {
        var putsAndCycleAgain = function(out, prefix) {
          io.puts(out, function() {
            io.gets($js.interpretJS);
          }, { prefix: prefix || "=&gt; " });
        };
        io.puts(js, function(js) {
          try {
            var r = $js.globalEval(js);
            switch(typeof r) {
              case "number":
                putsAndCycleAgain(r);
                break;
              case "string":
                putsAndCycleAgain('"'+r+'"');
                break;
              case "boolean":
                putsAndCycleAgain(r ? "true" : "false");
                break;
              default:
                if (typeof r == "undefined") {
                  putsAndCycleAgain("undefined");
                } else if (r == null) {
                  putsAndCycleAgain("null");
                } else {
                  putsAndCycleAgain(r.toString());
                }
            }
          } catch(err) {
            putsAndCycleAgain(err.name+": "+err.message, "&nbsp;&nbsp; ");
          }
        });
      } else {
        io.puts("JavaScript console closed\n", function() {
          io.checkout();
        }, { prefix: "" });
      }
    }
    io.reserve();
    io.gets($js.interpretJS);
  }
});