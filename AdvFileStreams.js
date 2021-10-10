#!/usr/bin/env node

"use strict";

import { createReadStream, createWriteStream } from "fs";
import { resolve, join } from "path";
import minimist from "minimist";
import { Stream } from "stream";
import { createGunzip, createGzip } from "zlib";
import CAF from 'caf';

const TransformStream = Stream.Transform;

var args = minimist(process.argv.slice(2), {
  boolean: ["help", "in", "out", "compress", "decompress"],
  string: ["file"]
});

processContents = CAF(processContents);

var BASE_PATH = resolve(process.env.BASE_PATH || resolve());

var OUT_FILE = join(BASE_PATH, "out.txt");

if(args.help) {
  printHelp();
} else if(args.in || args._.includes("-")) {
  let tooLong = CAF.timeout(10, "Took too long");
  processContents(tooLong, process.stdin).catch(error);
} else if(args.file) {
  let tooLong = CAF.timeout(10, "Took too long");
  var fileName = join(BASE_PATH, args.file);
  let stream = createReadStream(fileName);
  processContents(tooLong, stream).then(function() {
    console.log("\nStreaming is completed!")
  }).catch(error);
} else {
  error("Incorrect usage!!", true);
}

function *processContents(signal, inStream) {
  var targetStream;

  if(args.decompress) {
    let gunzipStream = createGunzip();
    inStream = inStream.pipe(gunzipStream);
  }

  var upperStream = new TransformStream({
    transform(chunk, encoding, callback) {
      this.push(chunk.toString().toUpperCase());
      callback()
    }
  });

  inStream = inStream.pipe(upperStream)
  
  if(args.compress) {
    let gzipStream = createGzip();
    inStream = inStream.pipe(gzipStream);
    OUT_FILE = `${OUT_FILE}.gz`;
  }

  if(args.out) {
    targetStream = process.stdout;
  } else {
    targetStream = createWriteStream(OUT_FILE);
  }

  inStream.pipe(targetStream);

  signal.pr.catch(function() {
    inStream.unpipe(targetStream);
    inStream.destroy();
  })

  yield streamComplete(inStream);
}

function error(msg, includeHelp = false) {
  console.error(msg);
  includeHelp && (console.log(""), printHelp());
}

function streamComplete (stream) {
  return new Promise(function(resolve) {
    stream.on("end", resolve);
  })
}

function printHelp() {
  console.log("test usage");
  console.log("  test.js --file={FILENAME}");
  console.log("");
  console.log("--help            print this help");
  console.log("--file={FILENAME} process this file");
  console.log("--in, -           process stdin")
  console.log("--out             print to stdout")
  console.log("--compress        will gzip the input");
  console.log("--decompress      will ungzip the input");
  console.log("");
}

