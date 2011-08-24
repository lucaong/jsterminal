// SKIN SPECIFIC CODE

// Create JSterminal.eventHandlers namespace if they do not exist
JSterminal.eventHandlers = JSterminal.eventHandlers || {};

// Redefine IO handlers
JSterminal.ioQueue.ioHandlers = {
  gets: function(request, io) {
    jQuery("#JSterminal_in_prefix").html(request.options.prefix || io.meta.prefixes.input || "");
    jQuery("#JSterminal_in").width(jQuery("#JSterminal_in_wrap").width() - jQuery("#JSterminal_in_prefix").width() - 20);
  },
  puts: function(request, io) {
    jQuery("#JSterminal_in_wrap").before((request.options.prefix || io.meta.prefixes.output || "")+(request.data.output||"")+"\n");
    jQuery("#JSterminal_out").scrollTop(jQuery("#JSterminal_out").attr("scrollHeight"));
    jQuery("#JSterminal_in").focus();
    io.meta.requestsQueue.shift();
    if (typeof request.callback == "function") {
      request.callback(request.data.output);
    }
    JSterminal.ioQueue.tidyUp();
  },
  default: function(request, io) {
    io.meta.requestsQueue.shift();
    JSterminal.ioQueue.tidyUp();
  }
}

// Handle onkeydown event in #JSterminal_in
JSterminal.eventHandlers.keyPressed = function(e) {
  e = e || window.event;
  var keycode = e.keyCode || e.which;
  // Handle input in the right scope
  var io = JSterminal.ioQueue.first();
  // Initialize input log and cursor if necessary
  io.meta.inputLog = (typeof io.meta.inputLog === "undefined") ? [] : io.meta.inputLog;
  io.meta.inputLogCursor = (typeof io.meta.inputLogCursor !== "number") ? -1 : io.meta.inputLogCursor;
  if(keycode === 13) {
    var i = jQuery("#JSterminal_in").val();
    jQuery("#JSterminal_in").val("");
    io.meta.inputLog.unshift(i);
    io.meta.inputLogCursor = -1;
    var request = io.meta.requestsQueue[0];
    if (!!request && request.type == "gets") {
      io.meta.requestsQueue.shift().callback(i);
      JSterminal.ioQueue.tidyUp();
    }
  } else if (keycode === 27) {
      if (io == JSterminal.terminalIO) {
        JSterminal.quit();
      } else {
        io.flushAllRequests();
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
    // Create an IO interface for the terminal itself if not existing
    if (typeof JSterminal.terminalIO === "undefined") {
      JSterminal.terminalIO = JSterminal.IO({ prefixes: {input: "", output: ""} });
    }
    JSterminal.terminalIO.puts("JSterminal version 0.0.3\n"+(new Date()).toLocaleString());
    jQuery("#JSterminal_in").focus();
  }
};

JSterminal.quit = function() {
  JSterminal.terminalIO.checkout();
  JSterminal.ioQueue.empty();
  JSterminal.terminalIO.meta.requestsQueue = [];
  jQuery("#JSterminal_container").remove();
}
