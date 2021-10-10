#!/usr/bin/env node

"use strict";

import util from 'util';
import sqlite3 from "sqlite3";
import http from 'http';
import { resolve } from "path";

import staticAlias from "node-static-alias";

const DB_PATH = resolve("my.db");
const WEB_PATH = resolve("web");
const HTTP_PORT = 8039;

var delay = util.promisify(setTimeout);

var myDB = new sqlite3.Database(DB_PATH);
var SQL3 = {
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

var fileServer = new staticAlias.Server(WEB_PATH, {
	cache: 100,
	serverInfo: "Node Workshop: ex5",
	alias: [
		{
			match: /^\/(?:index\/?)?(?:[?#].*$)?$/,
			serve: "index.html",
			force: true,
		},
		{
			match: /^\/js\/.+$/,
			serve: "<% absPath %>",
			force: true,
		},
		{
			match: /^\/(?:[\w\d]+)(?:[\/?#].*$)?$/,
			serve: function onMatch(params) {
				return `${params.basename}.html`;
			},
		},
		{
			match: /[^]/,
			serve: "404.html",
		},
	],
});

 

var httpserv = http.createServer(handleRequest);
main();

function main() {
  httpserv.listen(HTTP_PORT)
	console.log(`Listening on http://localhost:${HTTP_PORT}...`);
}

async function handleRequest(req, res) {
  if(req.url == "/get-records") {
    const records = await getAllRecords();
    await delay(1000);
    res.writeHead(200, {
      "Content-Type": "application/json",
      "Cache-Control": "no-cache"
    });
    res.end(JSON.stringify(records));
  } else {
    fileServer.serve(req, res)
  }
}

async function getAllRecords() {
	var result = await SQL3.all(
		`
		SELECT
			Something.data AS "something",
			Other.data AS "other"
		FROM
			Something
			JOIN Other ON (Something.otherID = Other.id)
		ORDER BY
			Other.id DESC, Something.data
		`
	);

	return result;
}
