// Override or mock IO functions
JSterminal.io.flush = function(out){
  $("#out").html("");
};
JSterminal.io.puts = function(out){
  $("#out").append((out||""));
};
JSterminal.io.gets = function(callback){
  callback("testinput");
};