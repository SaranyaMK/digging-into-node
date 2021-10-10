#!/usr/bin/env node

"use strict";

import util from 'util';
import childProc from 'child_process';

// ************************************

const HTTP_PORT = 8039;
const MAX_CHILDREN = 5;

var delay = util.promisify(setTimeout);

main().catch(console.error);


// ************************************

async function main() {
	// console.log(`Load testing http://localhost:${HTTP_PORT}...`);
  var x = 0
  while(true) {
    x++;
    if(x> 4) foo();
    process.stdout.write(`Trying ${MAX_CHILDREN} requests...`);
    const maxReqs = []
    for(let i = 0 ; i < MAX_CHILDREN ; i++) {
      maxReqs.push(childProc.spawn("node", ["Child.js"]));
    }

    let resps = maxReqs.map(child => {
      return new Promise((resolve, reject) => {
        child.on("exit", function(code) {
          code === 0 ? resolve(true) : resolve(false);
        })
      })
    })

    resps = await Promise.all(resps);
    const isAllSuccess = resps.every(resp => resp);

    if(isAllSuccess) {
      console.log("Success");
    } else {
      console.error("Failure")
    }
    await delay(500);
  }
}