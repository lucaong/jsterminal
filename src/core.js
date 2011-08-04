/*!
 * JSterminal
 *
 * Copyright 2011, Luca Ongaro
 * Licensed under the MIT license.
 *
 */


var JSterminal = (function() {
  var registeredCommands = {};

  return {
    // Function register(command, obj): register a command
    register: function(command, obj){
      registeredCommands[command] = obj;
      
      // Manage options aliases
      if (!!obj.options) {
        registeredCommands[command].optionAliases = registeredCommands[command].optionAliases || {};
        for(var i in obj.options) {
          if (!!obj.options[i].alias) {
            registeredCommands[command].optionAliases[obj.options[i].alias] = i;
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
      var io = this.terminalIO;
      
      // Parse options and arguments
      for(i = 0; i < input_array.length; i++) {
        var opt = (!!registeredCommands[command_name] && !!registeredCommands[command_name].options) ? 
          (registeredCommands[command_name].options[input_array[i]] || registeredCommands[command_name].options[registeredCommands[command_name].optionAliases[input_array[i]]]) :
            false;
        if (!!opt) {
          var opt_name = input_array.splice(i, 1)[0];
          opt_name = !!registeredCommands[command_name].options[opt_name] ? opt_name : registeredCommands[command_name].optionAliases[opt_name];
          options[opt_name] = !!opt.argument ? input_array.splice(i, 1)[0] : true;
          i--;
        } else {
          input_array[i] = input_array[i].replace(/^["']|["']$/g, "");
        }
      }
      
      // Execute command, or return false if it does not exist
      if(!!registeredCommands[command_name]) {
        // Istantiate an IO interface for this command, if not already present
        if (typeof registeredCommands[command_name].io == "undefined") {
          registeredCommands[command_name].io = JSterminal.IO();
        }
        registeredCommands[command_name].io.claim();
        return registeredCommands[command_name].execute(input_array, options);
      } else {
        io.puts("unknown command " + command_name);
        io.puts("type 'help' for a list of available commands");
        return false;
      }
    },
    // Object commands: object containing registered commands
    commands: registeredCommands,
    launch: function() {
      // Create an IO interface for the terminal itself if not existing
      if (typeof JSterminal.terminalIO === "undefined") {
        JSterminal.terminalIO = JSterminal.IO();
      }
      JSterminal.ioQueue.scheduleDefault();
    },
    // Function quit(): called to quit the terminal
    quit: function() {
      JSterminal.terminalIO.exit();
      JSterminal.ioQueue.empty();
      JSterminal.terminalIO.meta.requestsQueue = [];
      return false;
    },
    // Input/Output queue
    ioQueue: (function() { // Queue of IO interfaces that claimed control of input/output
      var queue = [];
      return {
        push: function(obj) {
          queue.push(obj);
        },
        first: function() {
          return queue[0];
        },
        tidyUp: function() {
          var io = queue[0];
          if (!!io && io.meta.requestsQueue.length == 0) {
            if (!io.isClaiming()) {
              queue.shift();
            }
          }
          JSterminal.ioQueue.serveNext();
        },
        serveNext: function() {
          var io = JSterminal.ioQueue.first();
          if (!!io) {
            var request = io.meta.requestsQueue[0];
            if (!!request) {
              switch(request.type) {
                case "gets":
                  this.ioHandlers.gets(request, io);
                  break;
                case "puts":
                  this.ioHandlers.puts(request, io);
                  break;
                default:
                  this.ioHandlers.other(request, io);
              }
            } else {
              return true;
            }
          } else {
            this.scheduleDefault();
          }
        },
        scheduleDefault: function() {
          JSterminal.terminalIO.claim();
          JSterminal.terminalIO.gets(function(s) {
            JSterminal.terminalIO.puts(s);
            try {
              JSterminal.interpret(s);
            } finally {
              JSterminal.terminalIO.exit();
            }
          });
        },
        contains: function(elem) {
          if (!!Array.prototype.indexOf) {
            return queue.indexOf(elem) >= 0;
          } else {
            for(var e in queue) if (queue.hasOwnProperty(e)) {
              if(queue[e] === elem){
                return true;
              }
            }
            return false;
          }
        },
        isEmpty: function() {
          return (!!this.first());
        },
        empty: function() {
          queue = [];
        },
        ioHandlers: {
          gets: function(request, io) {
            io.meta.requestsQueue.shift();
            if (typeof request.callback === "function") {
              request.callback(prompt(io.meta.prefixes.input || ""));
            }
            JSterminal.ioQueue.tidyUp();
          },
          puts: function(request, io) {
            console.log((io.meta.prefixes.output || "") + (request.data.output || ""));
            io.meta.requestsQueue.shift();
            if (typeof request.callback === "function") {
              request.callback(request.data.output);
            }
            JSterminal.ioQueue.tidyUp();
          },
          other: function(request, io) {
            io.meta.requestsQueue.shift();
            JSterminal.ioQueue.tidyUp();
          }
        }
      }
    })(),
    // Input/Output interface
    IO: function(opts) {
      var claiming = false;
      var m = {
        prefixes: {
          input: "&gt; ",
          output: ""
        },
        requestsQueue: []
      }
      for (k in opts) { if (opts.hasOwnProperty(k)) { m[k] = opts[k]; } }
      return {
        puts: function(out, callback) {
          this.meta.requestsQueue.push({type: "puts", callback: callback, data: {output: out}});
          this.enqueue();
          JSterminal.ioQueue.serveNext();
        },
        gets: function(callback) {
          this.meta.requestsQueue.push({type: "gets", callback: callback});
          this.enqueue();
          JSterminal.ioQueue.serveNext();
        },
        claim: function() {
          claiming = true;
          this.enqueue();
        },
        exit: function() {
          claiming = false;
          JSterminal.ioQueue.tidyUp();
        },
        isClaiming: function() {
          return !!claiming;
        },
        enqueue: function() {
          if (!JSterminal.ioQueue.contains(this)) {
            JSterminal.ioQueue.push(this);
          }
        },
        flushAllRequests: function() {
          this.meta.requestsQueue = [];
          this.exit();
        },
        meta: m
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
    var io = this.io;
    if(argv.length === 0) {
      io.puts("\nJSterminal\nA list of available commands (type help COMMAND_NAME to get help on a particular command):");
      io.puts();
      var sortedCommands = [];
      for (var c in JSterminal.commands) if (JSterminal.commands.hasOwnProperty(c)) {
        sortedCommands.push(c);
      }
      sortedCommands.sort();
      for (var i in sortedCommands) if (sortedCommands.hasOwnProperty(i))  {
        io.puts("  " + sortedCommands[i] + ": " + (JSterminal.commands[sortedCommands[i]].description || "no description"));
      }
      io.puts();
    } else {
      for(var i in argv) if (argv.hasOwnProperty(i)) {
        if(JSterminal.commands[argv[i]]) {
          io.puts(argv[i] + ":\n  " + (JSterminal.commands[argv[i]].help || "no help"));
          if(!!JSterminal.commands[argv[i]].options) {
            io.puts("\n  OPTIONS:");
            for(var j in JSterminal.commands[argv[i]].options) {
              var option_names = !!JSterminal.commands[argv[i]].options[j].alias ?
                [j, JSterminal.commands[argv[i]].options[j].alias] :
                [j];
              io.puts("    " + option_names.join(", ") + "\n      " + (JSterminal.commands[argv[i]].options[j].description || "no description") + "\n");
            }
          }
          io.puts("");
        } else {
          io.puts("unknown command " + argv[i]);
        }
      }
    }
    io.exit();
  }
});

// exit: closes the terminal
JSterminal.register("exit", {
  description: "exit JSterminal",
  help: "it closes JSterminal",
  execute: function(argv){
    this.io.exit();
    JSterminal.quit();
  }
});