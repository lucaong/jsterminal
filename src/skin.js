// SKIN SPECIFIC CODE

// Define or override io functions
JSterminal.io.flush = function(out){
  jQuery("#JSterminal_out").html("");
};
JSterminal.io.puts = function(out){
  jQuery("#JSterminal_in").before((out||"")+"\n");
  jQuery("#JSterminal_out").scrollTop(jQuery("#JSterminal_out").attr("scrollHeight"));
  jQuery("#JSterminal_in").focus();
};
JSterminal.io.gets = function(callback){
  JSterminal.io.inputMode = 1;
  JSterminal.io.getsCallback = function(s) {
    callback(s);
    JSterminal.io.inputMode = 0;
  }
};
JSterminal.io.inputs = [];
JSterminal.io.input_cursor = -1;
JSterminal.io.inputMode = 0;
JSterminal.io.keyPressed = function(e) {
  e = e || window.event;
  var keycode = e.keyCode || e.which;
  if(keycode === 13) {
    var i = jQuery("#JSterminal_in").val();
    if (JSterminal.io.inputMode == 0) {
      jQuery("#JSterminal_in").val("");
      JSterminal.io.puts(i);
      JSterminal.io.inputs.unshift(i);
      JSterminal.io.input_cursor = -1;
      JSterminal.interpret(i);
    } else {
      jQuery("#JSterminal_in").val("");
      JSterminal.io.getsCallback(i);
    }
  } else if (keycode === 27) {
    JSterminal.quit();
  } else if (keycode === 38) {
    if(JSterminal.io.input_cursor < JSterminal.io.inputs.length - 1) {
      jQuery("#JSterminal_in").val(JSterminal.io.inputs[++JSterminal.io.input_cursor]);
    }
  } else if (keycode === 40) {
    if(JSterminal.io.input_cursor >= 0) {
      jQuery("#JSterminal_in").val(JSterminal.io.inputs[--JSterminal.io.input_cursor]);
    }
  }
};

// Define launch and quit functions
JSterminal.launch = function(){
  if(jQuery("#JSterminal_container").length <= 0)
  {
    jQuery(document.body).prepend('<div id="JSterminal_container"><style type="text/css">#JSterminal_container {background: #000; background: rgba(0, 0, 0, 0.9); overflow: visible; padding: 0; margin: 0; z-index: 50000; position: fixed; top: 15px; left: 50%; margin-left: -300px; -moz-box-shadow: 2px 10px 50px #000; box-shadow: 2px 10px 100px #000; border: 1px solid #aaa; font-size: 12px;} #JSterminal_out {color: #0d0; padding: 1em; white-space: pre-wrap; font-family: Courier New, Courier, monospace; font-size: 14px; text-align: left; width: 600px; height: 400px; overflow-y: auto;} #JSterminal_in {width: 100%; background: #000; background: rgba(0, 0, 0, 0.9); border: none; color: #0d0; font-family: Courier New, Courier, monospace; font-size: 1em; outline-style: none;} #JSterminal_close {position: absolute; top: -8px; left: -8px; border: 2px solid #fff; background: #a00; -moz-border-radius: 16px; border-radius: 16px; width: 16px; height: 16px; overflow: hidden; text-align: center; -moz-box-shadow: 1px 2px 5px #000; box-shadow: 1px 2px 5px #333;} #JSterminal_close span:before {color: #fff; font-weight: normal; text-decoration: none; content: "\\D7"; font-size: 20px; font-family: Courier new, monospace; line-height: 17px;}</style><div id="JSterminal_close" onclick="JSterminal.interpret(\'exit\'); return false;"><span></span></div><div id="JSterminal_out" onclick="jQuery(\'#JSterminal_in\').focus()"><input type="text" id="JSterminal_in" onkeydown="JSterminal.io.keyPressed(event)" /></div></div>');
    JSterminal.io.puts("JSterminal version 0.0.3\n"+(new Date()).toLocaleString());
    jQuery("#JSterminal_in").focus();
  }
};
JSterminal.quit = function(){
  jQuery("#JSterminal_container").remove();
}

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