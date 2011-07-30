var testValue = "";

$(document).ready(function(){

  module("Core");
  
  var countCommands = function() {
    var count = 0;
    for(var n in JSterminal.commands) count++;
    return count;
  }
  
  initialNumOfCommands = countCommands();
  
  JSterminal.register("testcommand", {
    description: "a test command",
    help: "this is a help text",
    options: {
      "-n": {
        argument: true,
        description: "test option description"
      },
      "-o": {
        argument: false
      },
      "-a": {
        argument: true,
        alias: "--alias"
      }
    },
    execute: function(argv, options){
      if (argv.length > 0) {
        testValue = {arguments: argv, options: options};
      } else {
        JSterminal.io.gets(function(s) {
          JSterminal.io.flush();
          JSterminal.io.puts(s);
          testValue = s;
        });
      }
    }
  });

  JSterminal.register("testcommand_no_options", {
    description: "a test command",
    help: "this is a help text",
    execute: function(argv, options){
      if (argv.length > 0) {
        testValue = {arguments: argv, options: options};
      } else {
        JSterminal.io.gets(function(s) {
          JSterminal.io.flush();
          JSterminal.io.puts(s);
          testValue = s;
        });
      }
    }
  });

  test("custom command registration", function(){
    equals(countCommands(), initialNumOfCommands + 2,
      "after registration of two new commands, there should be two more commands");
  });

  test("access to command arguments and options", function() {
    JSterminal.interpret("testcommand testarg -n 123 -o testarg2 --alias 321");
    ok(testValue.arguments[0] == "testarg" && testValue.arguments[1] == "testarg2",
      "execute() should access the array of arguments");
      
    equals(testValue.options["-n"], "123",
      "execute() should access options with argument");
    
    equals(testValue.options["-a"], "321",
      "options can be aliased");
      
    ok(testValue.options["-o"],
      "execute() should access options without argument");
    
    JSterminal.interpret("testcommand_no_options testarg testarg2");
    ok(testValue.arguments[0] == "testarg" && testValue.arguments[1] == "testarg2",
      "if the command have no options, there should be no problem");
    
    JSterminal.interpret("testcommand");
    
    equals(testValue, "testinput",
      "command should be able to get input calling JSterminal.io.gets()");
    
    equals($("#out").html(), "testinput",
      "command should be able to print output calling JSterminal.io.puts()");
  });

  test("handling non-existent commands", function(){
    equals(JSterminal.interpret("nonexistingcommand arg"), false,
      "non-existent command should return false");
  });

  test("trailing spaces and multiple spaces between arguments", function(){
    JSterminal.interpret(" testcommand ok ");
    equals(testValue.arguments[0], "ok",
      "trailing spaces should not be a problem");
    
    JSterminal.interpret("testcommand  ok")
    equals(testValue.arguments[0], "ok",
      "multiple spaces should not be a problem");
  });

  test("quoted arguments", function(){
    JSterminal.interpret('testcommand " some text  with spaces "');
    equals(testValue.arguments[0], " some text  with spaces ",
      "arguments containing spaces, if quoted, should not be a problem");
    
    JSterminal.interpret('testcommand "oye \'como\' va"');
    equals(testValue.arguments[0], "oye 'como' va",
      "single quotes inside double quotes should not be a problem");
    
    JSterminal.interpret('testcommand \'oye "como" va\'');
    equals(testValue.arguments[0], 'oye "como" va',
      "double quotes inside single quotes should not be a problem");
  });

  test("'help' command", function() {
    JSterminal.io.flush();
    JSterminal.interpret("help testcommand_no_options");
    equals($("#out").html(), "testcommand_no_options:\n  this is a help text",
      "the 'help' command should provide help on command, if a 'help' property was provided");
    
    JSterminal.io.flush();
    JSterminal.interpret("help testcommand");
    equals($("#out:contains('test option description')").length, 1,
      "the 'help' command should provide a description of options, if available");
      
    equals($("#out:contains('-a, --alias')").length, 1,
      "the 'help' command should list options with their aliases");
  });

});