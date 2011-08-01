/*!
 * JSterminal
 *
 * Copyright 2011, Luca Ongaro
 * Licensed under the MIT license.
 *
 */


var JSterminal = (function() {
  var registered_commands = {};

  return {
    // Function register(command, obj): register a command
    register: function(command, obj){
      registered_commands[command] = obj;
      
      // Manage options aliases
      if (!!obj.options) {
        registered_commands[command].optionAliases = registered_commands[command].optionAliases || {};
        for(var i in obj.options) {
          if (!!obj.options[i].alias) {
            registered_commands[command].optionAliases[obj.options[i].alias] = i;
          }
        }
      }
    },
    // Function interpret(input_string): interpret input
    interpret: function(input_string){
      var i;
      var input_array = input_string.replace(/^\s+|\s+$/g, "").match(/[^"'\s]+|"[^"]*"|'[^']*'/g);
      var command_name = input_array.shift();
      var options = {};
      
      // Parse options and arguments
      for(i = 0; i < input_array.length; i++) {
        var opt = (!!registered_commands[command_name] && !!registered_commands[command_name].options) ? 
          (registered_commands[command_name].options[input_array[i]] || registered_commands[command_name].options[registered_commands[command_name].optionAliases[input_array[i]]]) :
            false;
        if (!!opt) {
          var opt_name = input_array.splice(i, 1)[0];
          opt_name = !!registered_commands[command_name].options[opt_name] ? opt_name : registered_commands[command_name].optionAliases[opt_name];
          options[opt_name] = !!opt.argument ? input_array.splice(i, 1)[0] : true;
          i--;
        } else {
          input_array[i] = input_array[i].replace(/^["']|["']$/g, "");
        }
      }
      
      // Execute command, or return false if it does not exist
      if(registered_commands[command_name]) {
        return registered_commands[command_name].execute(input_array, options);
      } else {
        JSterminal.io.puts("unknown command " + command_name);
        JSterminal.io.puts("type 'help' for a list of available commands");
        return false;
      }
    },
    // Object commands: object containing registered commands
    commands: registered_commands,
    launch: function() {
      var command = prompt("Insert a command:", "help");
      if (command) {
        JSterminal.interpret(command);
      }
    },
    // Function quit(): called to quit the terminal
    quit: function() {
      return false;
    },
    // Input/Output functions namespace
    io: {
      puts: function(out) {
        console.log(out || "");
      },
      gets: function(callback) {
        callback(prompt("Enter an input:", ""));
      }
    }
  };
})();

// BASIC COMMANDS REGISTRATION

// help: provides a list of available commands and help on specific commands
JSterminal.register("help", {
  description: "provides some help",
  help: "with no parameters it shows a list of available commands, passing the name of a command provides help on the command",
  execute: function(argv){
    if(argv.length === 0) {
      JSterminal.io.puts("\nJSterminal\nA list of available commands (type help COMMAND_NAME to get help on a particular command):");
      JSterminal.io.puts();
      var sortedCommands = [];
      for (var c in JSterminal.commands) if (JSterminal.commands.hasOwnProperty(c)) {
        sortedCommands.push(c);
      }
      sortedCommands.sort();
      for (var c in sortedCommands) {
        JSterminal.io.puts("  " + sortedCommands[c] + ": " + (JSterminal.commands[sortedCommands[c]].description || "no description"));
      }
      JSterminal.io.puts();
    } else {
      for(var i in argv) {
        if(JSterminal.commands[argv[i]]) {
          JSterminal.io.puts(argv[i] + ":\n  " + (JSterminal.commands[argv[i]].help || "no help"));
          if(!!JSterminal.commands[argv[i]].options) {
            JSterminal.io.puts("\n  OPTIONS:");
            for(var j in JSterminal.commands[argv[i]].options) {
              var option_names = !!JSterminal.commands[argv[i]].options[j].alias ?
                [j, JSterminal.commands[argv[i]].options[j].alias] :
                [j];
              JSterminal.io.puts("    " + option_names.join(", ") + "\n      " + (JSterminal.commands[argv[i]].options[j].description || "no description") + "\n");
            }
          }
        } else {
          JSterminal.io.puts("unknown command " + argv[i]);
        }
      }
    }
  }
});

// exit: closes the terminal
JSterminal.register("exit", {
  description: "exit JSterminal",
  help: "it closes JSterminal",
  execute: function(argv){
    JSterminal.quit();
  }
});