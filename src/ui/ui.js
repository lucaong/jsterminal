// SKIN SPECIFIC CODE

// Create JSterminal.eventHandlers namespace if it does not exist
JSterminal.eventHandlers = JSterminal.eventHandlers || {};

// Redefine IO handlers
JSterminal.ioQueue.ioHandlers = {
  gets: function(request, io) {
    jQuery("#JSterminal_in_prefix").html(typeof request.options.prefix != "undefined" ? request.options.prefix : (io.options.prefixes.input || ""));
    jQuery("#JSterminal_in").width(jQuery("#JSterminal_in_wrap").width() - jQuery("#JSterminal_in_prefix").width() - 20);
  },
  puts: function(request, io) {
    var escapedOutput = jQuery("<div/>").text(request.data.output||"").html();
    jQuery("#JSterminal_in_wrap").before("<span class=\"JSterminal_puts_prefix\">" + (typeof request.options.prefix != "undefined" ? request.options.prefix : (io.options.prefixes.output || "")) + "</span><span class=\"JSterminal_puts_line\"" + (typeof request.options.style == "string" ? " style=\""+request.options.style+"\"" : "") + ">" + escapedOutput + "</span><br>");
    jQuery("#JSterminal_out").scrollTop(jQuery("#JSterminal_out").attr("scrollHeight"));
    jQuery("#JSterminal_in").focus();
    io.requestsQueue.shift();
    if (typeof request.callback == "function") {
      request.callback(request.data.output);
    }
    JSterminal.ioQueue.tidyUp();
  }
};

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
};

// Handle onkeydown event in #JSterminal_in
JSterminal.eventHandlers.keyPressed = function(e) {
  e = e || window.event;
  var keycode = e.keyCode || e.which;
  // Handle input in the right scope
  var io = JSterminal.ioQueue.first();
  // Initialize input log and cursor if necessary
  io.inputLog = (typeof io.inputLog === "undefined") ? [] : io.inputLog;
  io.inputLogCursor = (typeof io.inputLogCursor !== "number") ? -1 : io.inputLogCursor;
  if(keycode === 13) { // Return key
    var i = jQuery("#JSterminal_in").val();
    jQuery("#JSterminal_in").val("");
    io.inputLog.unshift(i);
    io.inputLogCursor = -1;
    var request = io.requestsQueue[0];
    if (!!request && request.type == "gets") {
      io.requestsQueue.shift().callback(i);
      JSterminal.ioQueue.tidyUp();
    }
  } else if (keycode === 27) { // Esc key
      if (io == JSterminal.terminalIO) {
        JSterminal.quit();
      } else {
        io.flushAllRequests();
      }
  } else if (keycode === 38) { // Up key
    if(io.inputLogCursor < io.inputLog.length - 1) {
      jQuery("#JSterminal_in").val(io.inputLog[++io.inputLogCursor]);
      return false; // Avoid placing the cursor at the beginning
    }
  } else if (keycode === 40) { // Down key
    if(io.inputLogCursor >= 0) {
      jQuery("#JSterminal_in").val(io.inputLog[--io.inputLogCursor] || "");
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
    JSterminal.terminalIO.puts("JSterminal version 0.0.4\n"+(new Date()).toLocaleString());
    jQuery("#JSterminal_in").focus();
  }
};

JSterminal.quit = function() {
  JSterminal.terminalIO.checkout();
  JSterminal.ioQueue.empty();
  JSterminal.terminalIO.requestsQueue = [];
  jQuery("#JSterminal_container").remove();
};

