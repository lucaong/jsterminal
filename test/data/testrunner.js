// Mock IO interface

JSterminal.IO = function() {
  return {
    puts: function(out) {
      $("#out").append((out||""));
    },
    gets: function(callback) {
      callback("testinput");
    },
    flush: function(out) {
      $("#out").html("");
    }
  }
}