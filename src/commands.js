// CUSTOM COMMAND REGISTRATION

JSterminal.register("tweet", {
  description: "share on Twitter",
  help: "it shares the current URL on Twitter, adding (in order of precedence) the text passed as argument or the page title in the status text",
  execute: function(argv){
    window.open("http://twitter.com/share?url="+location.href+"&text="+encodeURI(argv.join(" ") || document.title));
  }
});

JSterminal.register("s", {
  options: {
    "-d": {
      argument: true,
      description: "top level domain to use (e.g. 'com', 'de' or 'it'). Default is 'com'.",
      alias: "--domain"
    }
  },
  description: "search on Google",
  help: "it searches the string passed as argument on Google\nSynopsis:\n  s SEARCH_QUERY",
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
  execute: function(argv){
    window.open("http://delicious.com/save?url="+location.href+"&title="+(argv[0] || document.title)+"&v=5&jump=yes&notes="+(argv[1]||""));
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
  execute: function(argv){
    var $cssConsole = this;
    $cssConsole.cache = $cssConsole.cache || "";
    $cssConsole.addStyle = function(css) {
      if (css != 'q' && css != 'quit' && css != 'Q') {
        JSterminal.io.puts(css);
        $cssConsole.cache += " "+css;
        if (!document.getElementById("JSterminal-css-console-style")) {
          var style = document.createElement("style");
          style.id = "JSterminal-css-console-style";
          style.type = "text/css";
          document.body.appendChild(style);
        }
        document.getElementById("JSterminal-css-console-style").innerHTML = $cssConsole.cache;
        JSterminal.io.gets($cssConsole.addStyle);
      } else {
        JSterminal.io.puts("CSS console closed\n");
      }
    }
    JSterminal.io.gets($cssConsole.addStyle);
  }
});

JSterminal.register("js", {
  description: "JavaScript console",
  help: "it opens an interactive JavaScript console. Enter 'quit' or 'q' to quit the console.",
  execute: function(argv){
    var $jsConsole = this;
    $jsConsole.globalEval = (function() {
      // globalEval code by by kangax http://perfectionkills.com/global-eval-what-are-the-options/
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
    $jsConsole.interpretJS = function(js) {
      if (js != 'q' && js != 'quit' && js != 'Q') {
        JSterminal.io.puts(js);
        try {
          var r = $jsConsole.globalEval(js);
          JSterminal.io.puts(typeof r == "number" ? r : (typeof r == "string" ? '"'+r+'"' : '"'+ typeof r +'"'));
        } catch(err) {
          JSterminal.io.puts(err);
        }
        JSterminal.io.gets($jsConsole.interpretJS);
      } else {
        JSterminal.io.puts("JavaScript console closed\n");
      }
    }
    JSterminal.io.gets($jsConsole.interpretJS);
  }
});