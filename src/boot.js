// BOOT

// Load jQuery if needed and launch JSterminal
if(typeof jQuery === 'undefined') {
  var script = document.createElement("script");
  script.src = "https://ajax.googleapis.com/ajax/libs/jquery/1.5.0/jquery.min.js";
  script.onload = function(){
    JSterminal.launch();
  };
  document.body.appendChild(script);
} else {
  JSterminal.launch();
}