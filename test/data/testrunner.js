// Mock IO handlers
JSterminal.ioQueue.ioHandlers = {
  gets: function(request, io) {
    var r = io.meta.requestsQueue.shift();
    if (typeof r.callback === "function") {
      r.callback("testinput");
    }
    JSterminal.ioQueue.tidyUp();
  },
  puts: function(request, io) {
    $("#out").html(request.data.output);
    var r = io.meta.requestsQueue.shift();
    if (typeof r.callback === "function") {
      r.callback(request.data.output);
    }
    JSterminal.ioQueue.tidyUp();
  },
  default: function(request, io) {
    io.meta.requestsQueue.shift();
    JSterminal.ioQueue.tidyUp();
  }
}


// Mock launch
JSterminal.launch = function() {
  // Create an IO interface for the terminal itself if not existing
  if (typeof JSterminal.terminalIO === "undefined") {
    JSterminal.terminalIO = JSterminal.IO();
  }
}

JSterminal.ioQueue.scheduleDefault = function() {
  return true;
}
