// SKIN SPECIFIC CODE

// Create JSterminal.eventHandlers namespace if they do not exist
JSterminal.eventHandlers = JSterminal.eventHandlers || {};

// Redefine IO handlers
JSterminal.ioQueue.ioHandlers = {
  gets: function(request, io) {
    jQuery("#JSterminal_in_prefix").html(typeof request.options.prefix != "undefined" ? request.options.prefix : (io.meta.prefixes.input || ""));
    jQuery("#JSterminal_in").width(jQuery("#JSterminal_in_wrap").width() - jQuery("#JSterminal_in_prefix").width() - 20);
  },
  puts: function(request, io) {
    jQuery("#JSterminal_in_wrap").before((typeof request.options.prefix != "undefined" ? request.options.prefix : (io.meta.prefixes.output || ""))+(request.data.output||"")+"\n");
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

// Redefine ioQueue.scheduleDefaultRequest
JSterminal.ioQueue.scheduleDefaultRequest = function() {
  JSterminal.terminalIO.reserve();
  JSterminal.terminalIO.gets(function(s) {
    JSterminal.terminalIO.puts(s, function() {
      try {
        JSterminal.interpret(s);
      } finally {
        JSterminal.terminalIO.checkout();
      }
    }, { prefix: "&gt; "});
  });
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
  if(keycode === 13) { // Return key
    var i = jQuery("#JSterminal_in").val();
    jQuery("#JSterminal_in").val("");
    io.meta.inputLog.unshift(i);
    io.meta.inputLogCursor = -1;
    var request = io.meta.requestsQueue[0];
    if (!!request && request.type == "gets") {
      io.meta.requestsQueue.shift().callback(i);
      JSterminal.ioQueue.tidyUp();
    }
  } else if (keycode === 27) { // Esc key
      if (io == JSterminal.terminalIO) {
        JSterminal.quit();
      } else {
        io.flushAllRequests();
      }
  } else if (keycode === 38) { // Up key
    if(io.meta.inputLogCursor < io.meta.inputLog.length - 1) {
      jQuery("#JSterminal_in").val(io.meta.inputLog[++io.meta.inputLogCursor]);
      return false; // Avoid placing the cursor at the beginning
    }
  } else if (keycode === 40) { // Down key
    if(io.meta.inputLogCursor >= 0) {
      jQuery("#JSterminal_in").val(io.meta.inputLog[--io.meta.inputLogCursor] || "");
    }
  }
};

// Override launch and quit functions
JSterminal.launch = function() {
  if(jQuery("#JSterminal_container").length <= 0)
  {
    jQuery(document.body).prepend("!!BUILDER-WILL-SUBSTITUTE-UI-HTML-HERE!!");
    // Create an IO interface for the terminal itself if not existing
    if (typeof JSterminal.terminalIO === "undefined") {
      JSterminal.terminalIO = JSterminal.IO({ prefixes: {input: "&gt; ", output: ""} });
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

