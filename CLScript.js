#!/usr/bin/env node
//shebang or hah bang comment - it tells shell about what program to hand off the execution to instead of trying to execute as bash script
//You can directly give your node env location after #! also
//this way it'll work for all OS(Linux/Mac). The env will find of executable and use it for interpreting the program for the name we pass

"use strict";

//chmod u+x filename.js
//this makes it an executable file
//Instead of 'node test.js' just './test.js' would run it

import { readFile } from "fs";
import { resolve, join } from "path";
import getStdin from "get-stdin";
import minimist from "minimist";

var args = minimist(process.argv.slice(2), {
  boolean: ["help", "in"],
  string: ["file"]
});

//BASE_PATH=./ ./CLScript.js --file=test.txt
var BASE_PATH = resolve(process.env.BASE_PATH || __dirname);

if(args.help) {
  printHelp();
} else if(args.in || args._.includes("-")) {
  //cat test.txt | ./CLScript.js --in 
  //cat test.txt | ./CLScript.js -
  getStdin().then(processContents).catch(error);
} else if(args.file) {
  /*
  var contents = fs.readFileSync(path.resolve(args.file));
  console.log(contents); //<Buffer 48 65 6c 6c 6f 20 4b 69 74 74 79> // because by the time it got to the shell, console log stringified the contents into a string
  console.log(contents.toString()); // Hello Kitty
  process.stdout.write(contents); // Hello Kitty
  */

  /*
  var contents = fs.readFileSync(path.resolve(args.file), "utf8");
  console.log(contents); // Hello Kitty
  */

  //var fileName = resolve(args.file);
  var fileName = join(BASE_PATH, args.file);
  readFile(fileName, function(err, contents) {
    if(err) {
      return error(err);
    }
    processContents(contents.toString());
  })
} else {
  error("Incorrect usage!!", true);
}

function processContents(contents) {
  console.log(contents.toUpperCase());
}

function error(msg, includeHelp = false) {
  console.error(msg);
  includeHelp && (console.log(""), printHelp());
}

function printHelp() {
  console.log("test usage");
  console.log("  test.js --file={FILENAME}");
  console.log("");
  console.log("--help            print this help");
  console.log("--file={FILENAME} process this file");
  console.log("--in, -           process stdin")
  console.log("");
}
