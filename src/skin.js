// SKIN SPECIFIC CODE

// Create JSterminal.meta and JSterminal.eventHandlers namespaces if they do not exist
JSterminal.meta = JSterminal.meta || {};
JSterminal.eventHandlers = JSterminal.eventHandlers || {};

// Implement IO queue
JSterminal.ioQueue = (function() { // Queue of IO interfaces that claimed control of input/output
  var queue = [];
  return {
    push: function(obj) {
      queue.push(obj);
    },
    first: function() {
      return queue[0];
    },
    firstWasServed: function() {
      var io = queue[0];
      if (!!io && io.meta.requestsQueue.length == 0) {
        if (!io.isClaiming()) {
          queue.shift();
        }
      }
      JSterminal.ioQueue.serveNext();
    },
    serveNext: function() {
      var io = JSterminal.ioQueue.first();
      if (!!io) {
        var request = io.meta.requestsQueue[0];
        if (!!request) {
          switch(request.type) {
            case "gets":
              jQuery("#JSterminal_in_prefix").html(io.meta.prefixes.input || "");
              break;
            case "puts":
              jQuery("#JSterminal_in_wrap").before((io.meta.prefixes.output || "")+(request.data.output||"")+"\n");
              jQuery("#JSterminal_out").scrollTop(jQuery("#JSterminal_out").attr("scrollHeight"));
              jQuery("#JSterminal_in").focus();
              if (typeof request.callback == "function") {
                request.callback(request.data.output);
              }
              io.meta.requestsQueue.shift();
              JSterminal.ioQueue.firstWasServed();
              break;
            default:
              io.meta.requestsQueue.shift();
              JSterminal.ioQueue.firstWasServed();
          }
        }
      } else {
        JSterminal.meta.termIO.claim();
        JSterminal.meta.termIO.gets(function(s) {
          JSterminal.meta.termIO.puts(s);
          try {
            JSterminal.interpret(s);
          } finally {
            JSterminal.meta.termIO.release();
          }
        });
      }
    },
    contains: function(elem) {
      return jQuery.inArray(elem, queue) >= 0;
    },
    isEmpty: function() {
      return (!!this.first());
    },
    empty: function() {
      queue = [];
    }
  }
})();

// Redefine IO interface
JSterminal.IO = function(opts) {
  var m = {
    prefixes: {
      input: "",
      output: ""
    },
    inputLog: [],
    inputLogCursor: -1,
    requestsQueue: [],
  }
  var claiming = false;
  for (k in opts) { if (opts.hasOwnProperty(k)) { m[k] = opts[k]; } }
  return {
    puts: function(out, callback) {
      this.meta.requestsQueue.push({type: "puts", callback: callback, data: {output: out}});
      this.enqueue();
      JSterminal.ioQueue.serveNext();
    },
    gets: function(callback) {
      this.meta.requestsQueue.push({type: "gets", callback: callback});
      this.enqueue();
      JSterminal.ioQueue.serveNext();
    },
    claim: function() {
      claiming = true;
      this.enqueue();
    },
    enqueue: function() {
      if (!JSterminal.ioQueue.contains(this)) {
        JSterminal.ioQueue.push(this);
      }
    },
    release: function() {
      claiming = false;
      JSterminal.ioQueue.firstWasServed();
    },
    reset: function() {
      claiming = false;
      this.meta.requestsQueue = [];
      JSterminal.ioQueue.firstWasServed();
    },
    isClaiming: function() {
      return claiming;
    },
    meta: m
  }
}

// Terminal input/output interface
JSterminal.meta.termIO = JSterminal.IO();

// Handle onkeydown event in #JSterminal_in
JSterminal.eventHandlers.keyPressed = function(e) {
  e = e || window.event;
  var keycode = e.keyCode || e.which;
  // Handle input in the right scope
  var io = JSterminal.ioQueue.first();
  if(keycode === 13) {
    var i = jQuery("#JSterminal_in").val();
    jQuery("#JSterminal_in").val("");
    io.meta.inputLog.unshift(i);
    io.meta.inputLogCursor = -1;
    var request = io.meta.requestsQueue[0];
    if (!!request && request.type == "gets") {
      io.meta.requestsQueue.shift().callback(i);
      JSterminal.ioQueue.firstWasServed();
    }
  } else if (keycode === 27) {
      if (io == JSterminal.meta.termIO) {
        JSterminal.quit();
      } else {
        io.reset();
      }
  } else if (keycode === 38) {
    if(io.meta.inputLogCursor < io.meta.inputLog.length - 1) {
      jQuery("#JSterminal_in").val(io.meta.inputLog[++io.meta.inputLogCursor]);
      return false; // Avoid placing the cursor at the beginning
    }
  } else if (keycode === 40) {
    if(io.meta.inputLogCursor >= 0) {
      jQuery("#JSterminal_in").val(io.meta.inputLog[--io.meta.inputLogCursor] || "");
    }
  }
};

// Override launch and quit functions
JSterminal.launch = function() {
  if(jQuery("#JSterminal_container").length <= 0)
  {
    jQuery(document.body).prepend('<div id="JSterminal_container"><style type="text/css">#JSterminal_container {background: #000; background: rgba(0, 0, 0, 0.9); overflow: visible; padding: 0; margin: 0; z-index: 50000; position: fixed; top: 15px; left: 50%; margin-left: -300px; width: auto; -moz-box-shadow: 2px 10px 50px #000; box-shadow: 2px 10px 100px #000; border: 1px solid #aaa; font-size: 12px; line-height: 120%;} #JSterminal_out {background: transparent; color: #0d0; padding: 1em; white-space: pre-wrap; font-family: Courier New, Courier, monospace; font-size: 14px; text-align: left; width: 600px; height: 400px; overflow-y: auto;} #JSterminal_in_wrap {margin: 0; padding: 0;} #JSterminal_in {width: 560px; background: #000; background: rgba(0, 0, 0, 0.9); border: none; color: #0d0; font-family: Courier New, Courier, monospace; font-size: 1em; outline-style: none;} #JSterminal_close {position: absolute; top: -8px; left: -8px; border: 2px solid #fff; background: #a00; -moz-border-radius: 16px; border-radius: 16px; width: 16px; height: 16px; overflow: hidden; text-align: center; -moz-box-shadow: 1px 2px 5px #000; box-shadow: 1px 2px 5px #333;} #JSterminal_close span:before { vertical-align: middle; color: #fff; font-weight: normal; text-decoration: none; content: "\\D7"; font-size: 20px; font-family: Courier new, monospace; line-height: 17px;}</style><div id="JSterminal_close" onclick="JSterminal.interpret(\'exit\'); return false;"><span></span></div><div id="JSterminal_out" onclick="jQuery(\'#JSterminal_in\').focus()"><div id="JSterminal_in_wrap"><span id="JSterminal_in_prefix"></span><input type="text" id="JSterminal_in" onkeydown="return JSterminal.eventHandlers.keyPressed(event)" /></div></div></div>');
    JSterminal.meta.termIO.puts("JSterminal version 0.0.3\n"+(new Date()).toLocaleString());
    jQuery("#JSterminal_in").focus();
  }
};

JSterminal.quit = function() {
  JSterminal.ioQueue.empty();
  jQuery("#JSterminal_container").remove();
}
