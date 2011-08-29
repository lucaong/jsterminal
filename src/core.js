/*!
 * JSterminal
 *
 * Copyright 2011, Luca Ongaro
 * Licensed under the MIT license.
 *
 */

// CORE FUNCTIONALITIES
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
      var i,
        input_array = input_string.replace(/^\s+|\s+$/g, "").match(/[^"'\s]+|"[^"]*"|'[^']*'/g),
        command_name = input_array.shift(),
        options = {},
        io = this.terminalIO;
      
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
        return registeredCommands[command_name].execute(input_array, options);
      } else {
        io.puts("unknown command " + command_name + "\ntype 'help' for a list of available commands");
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
      JSterminal.ioQueue.scheduleDefaultRequest();
    },
    // Function quit(): called to quit the terminal
    quit: function() {
      JSterminal.terminalIO.checkout();
      JSterminal.ioQueue.empty();
      JSterminal.terminalIO.requestsQueue = [];
      return false;
    },
    // Input/Output queue
    ioQueue: (function() { // Queue of IO interfaces that reserved control of input/output
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
          if (!!io && io.requestsQueue.length === 0) {
            if (!io.isReserving()) {
              queue.shift();
            }
          }
          JSterminal.ioQueue.serveNext();
        },
        serveNext: function() {
          var io = JSterminal.ioQueue.first();
          if (!!io) {
            var request = io.requestsQueue[0];
            if (!!request) {
              // Use the appropriate ioHandler depending on request type
              if(this.ioHandlers.hasOwnProperty(request.type)) {
                this.ioHandlers[request.type](request, io);
              } else {
                io.requestsQueue.shift();
                JSterminal.ioQueue.tidyUp();
              }
            } else {
              return true;
            }
          } else {
            this.scheduleDefaultRequest();
          }
        },
        // Default request: when ioQueue is empty, the terminal takes control pushing its own IO interface in the queue
        scheduleDefaultRequest: function() {
          JSterminal.terminalIO.reserve();
          JSterminal.terminalIO.gets(function(s) {
            try {
              JSterminal.interpret(s);
            } finally {
              JSterminal.terminalIO.checkout();
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
        // Default IO handlers, to be overridden by each particular UI implementation
        ioHandlers: {
          gets: function(request, io) {
            io.requestsQueue.shift();
            if (typeof request.callback === "function") {
              request.callback(prompt(typeof request.options.prefix != "undefined" ? request.options.prefix : (io.options.prefixes.input || "")));
            }
            JSterminal.ioQueue.tidyUp();
          },
          puts: function(request, io) {
            console.log((typeof request.options.prefix != "undefined" ? request.options.prefix : (io.options.prefixes.output || "")) + (request.data.output || ""));
            io.requestsQueue.shift();
            if (typeof request.callback === "function") {
              request.callback(request.data.output);
            }
            JSterminal.ioQueue.tidyUp();
          }
        }
      };
    })(),
    // Input/Output interface factory
    IO: function(opts) {
      var reserving = false,
        defaultOptions = {
          prefixes: {
            input: "&gt; ",
            output: ""
          }
        },
        k;
      for (k in opts) { if (opts.hasOwnProperty(k)) { defaultOptions[k] = opts[k]; } }
      return {
        puts: function(out, callback, options) {
          // Push a request for a 'puts' action in the requestsQueue, make sure this IO interface is enqueued and go serving the next request
          this.requestsQueue.push({type: "puts", callback: callback, data: {output: out}, options: options || {}});
          this.enqueue();
          JSterminal.ioQueue.serveNext();
        },
        gets: function(callback, options) {
          // Push a request for a 'gets' action in the requestsQueue, make sure this IO interface is enqueued and go serving the next request
          this.requestsQueue.push({type: "gets", callback: callback, options: options || {}});
          this.enqueue();
          JSterminal.ioQueue.serveNext();
        },
        reserve: function() {
          // Ask to reserve IO control to this IO interface until checkout() is called
          reserving = true;
          this.enqueue();
        },
        checkout: function() {
          // Release IO control
          reserving = false;
          JSterminal.ioQueue.tidyUp();
        },
        isReserving: function() {
          return !!reserving;
        },
        enqueue: function() {
          // Push this IO interface in the ioQueue if it is not already there
          if (!JSterminal.ioQueue.contains(this)) {
            JSterminal.ioQueue.push(this);
          }
        },
        flushAllRequests: function() {
          // Empty requestsQueue and release IO
          this.requestsQueue = [];
          this.checkout();
        },
        setOptions: function(options) {
          var k;
          for (k in options) { if (options.hasOwnProperty(k)) { this.options[k] = options[k]; } }
        },
        requestsQueue: [],
        options: defaultOptions
      };
    }
  };
})();
