#!/usr/bin/env node

const fs = require("fs");
const fetch = require("node-fetch");
const csv = require("csvtojson");
var sleep = require("sleep");

let CSVDataPath = "./data/NYT_county.csv";

async function getCSVData() {
  const response = await fetch(
    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv"
  );
  const dest = fs.createWriteStream(CSVDataPath);
  await response.body.pipe(dest);

  console.log("Downloaded CSV data from GitHub");
}

console.log("Converting CSV to JSON");
csv()
  .fromFile(CSVDataPath)
  .then((json) => {
    console.log("Writing JSON to data file");
    fs.writeFileSync("./data/us-counties.json", JSON.stringify(json));
    console.log("Refresh complete");
  });
