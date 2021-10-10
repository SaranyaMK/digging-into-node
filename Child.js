"use strict";

import fetch from "node-fetch";

main().catch(() => 1);

async function main() {

  try {
    const resp = await fetch("http://localhost:8039/get-records");
    if(resp.ok) {
      const records = await resp.json();
      if(records && records.length > 0) {
        process.exitCode = 0;
        return; 
      }
    }
  } catch(err) {
    console.error(err);
    process.exitCode = 1;
  }
  process.exitCode = 1;
}