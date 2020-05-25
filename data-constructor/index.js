#!/usr/bin/env node

let idealStructure = {
  "01-01-2020": {
    fips_Code: "county_data",
    fips_code2: "county data",
    fips_code3: "county data",
  },
};

const fs = require("fs");

const rawData = require("./data/us-counties.json");
let dateToEntryMap = {};

console.log(`US Counties entries: ${rawData.length}`);

rawData.forEach((entry) => {
  let date = entry.date;
  if (dateToEntryMap[date] === undefined) {
    dateToEntryMap[date] = {};
  }
  dateToEntryMap[date][entry.fips] = entry;
});

fs.writeFileSync(
  "../app/src/data/processed-data-per-county.json",
  JSON.stringify(dateToEntryMap)
);
