#!/usr/bin/env node

"use strict";

import util from 'util';
import minimist from "minimist";
import { resolve } from "path";
import { readFileSync } from 'fs';

import sqlite3 from "sqlite3";

// ************************************

const DB_PATH = resolve("my.db");
const DB_SQL_PATH = resolve("mydb.sql");

var args = minimist(process.argv.slice(2),{
	string: ["other"]
});

main().catch(console.error);


// ************************************

var SQL3;

async function main() {
	if (!args.other) {
		error("Missing '--other=..'");
		return;
	}

	// define some SQLite3 database helpers
	var myDB = new sqlite3.Database(DB_PATH);
	SQL3 = {
		run(...args) {
			return new Promise(function c(resolve,reject){
				myDB.run(...args,function onResult(err){
					if (err) reject(err);
					else resolve(this);
				});
			});
		},
		get: util.promisify(myDB.get.bind(myDB)),
		all: util.promisify(myDB.all.bind(myDB)),
		exec: util.promisify(myDB.exec.bind(myDB)),
	};

	var initSQL = readFileSync(DB_SQL_PATH,"utf-8");
	await SQL3.exec(initSQL);


	var other = args.other;
	var something = Math.trunc(Math.random() * 1E9);

  var otherID = await insertOrLookupOther(other);
  if(otherID) {
    const result = await insertIntoSomthing(otherID, something);
    if(result) {
      console.log("Success");
      const records = await getAllRecords();
      if(records && records.length > 0) {
        console.table(records);
      }
      return;
    }
  }

	error("Oops!");
}

async function insertIntoSomthing(otherID, something) {
  let result = await SQL3.get('SELECT id FROM something WHERE otherID = ?', otherID);

  if(result && result.id) {
    result = await SQL3.run(`UPDATE something SET data = ? WHERE id = ?`, something, result.id);
  } else {
    result = await SQL3.run(`INSERT INTO something (otherID, data) VALUES (?, ?)`, otherID, something);
  }
  
  if(result && result.changes > 0) {
    return true;
  }
  return false;
}

async function insertOrLookupOther(other) {
  let result = await SQL3.get(`SELECT id FROM other WHERE data = ?`, other);

  if(result && result.id) {
    return result.id;
  } else {
    result = await SQL3.run(`INSERT INTO other (data) VALUES (?)`, other);
    if(result && result.lastID) {
      return result.lastID
    }
  }
}

async function getAllRecords() {
  const result = await SQL3.all(`
    SELECT 
      Other.data as 'other',
      Something.data as 'something'
    FROM
      Something JOIN Other
      ON (Something.otherID = Other.id)
    ORDER BY
      Other.id DESC, Something.data ASC
  `);

  if(result && result.length > 0) {
    return result
  }
}

function error(err) {
	if (err) {
		console.error(err.toString());
		console.log("");
	}
}
