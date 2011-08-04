// BASIC COMMANDS REGISTRATION

// help: provides a list of available commands and help on specific commands
JSterminal.register("help", {
  description: "provides some help",
  help: "with no parameters it shows a list of available commands, passing the name of a command provides help on the command",
  execute: function(argv){
    var io = this.io;
    var out = "";
    if(argv.length === 0) {
      out += "\nJSterminal\nA list of available commands (type help COMMAND_NAME to get help on a particular command):\n";
      var sortedCommands = [];
      for (var c in JSterminal.commands) if (JSterminal.commands.hasOwnProperty(c)) {
        sortedCommands.push(c);
      }
      sortedCommands.sort();
      for (var i in sortedCommands) if (sortedCommands.hasOwnProperty(i))  {
        out += "\n  " + sortedCommands[i] + ": " + (JSterminal.commands[sortedCommands[i]].description || "no description");
      }
      out += "\n";
    } else {
      for(var i in argv) if (argv.hasOwnProperty(i)) {
        if(JSterminal.commands[argv[i]]) {
          out += argv[i] + ":\n  " + (JSterminal.commands[argv[i]].help || "no help");
          if(!!JSterminal.commands[argv[i]].options) {
            out += "\n\n  OPTIONS:";
            for(var j in JSterminal.commands[argv[i]].options) {
              var option_names = !!JSterminal.commands[argv[i]].options[j].alias ?
                [j, JSterminal.commands[argv[i]].options[j].alias] :
                [j];
              out += "\n    " + option_names.join(", ") + "\n      " + (JSterminal.commands[argv[i]].options[j].description || "no description") + "\n";
            }
          }
          out += "\n";
        } else {
          out += "unknown command " + argv[i];
        }
      }
    }
    io.puts(out, function() { io.checkout(); });
  }
});

// exit: closes the terminal
JSterminal.register("exit", {
  description: "exit JSterminal",
  help: "it closes JSterminal",
  execute: function(argv){
    this.io.checkout();
    JSterminal.quit();
  }
});