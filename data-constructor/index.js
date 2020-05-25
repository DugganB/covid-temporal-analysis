#!/usr/bin/env node

let idealStructure = {
  "01-01-2020": {
    fips_Code: "county_data",
    fips_code2: "county data",
    fips_code3: "county data",
  },
};

const fs = require("fs");
const moment = require("moment");

const rawData = require("./data/us-counties.json");
let dateToEntryMap = {};

console.log(`US Counties entries: ${rawData.length}`);

rawData.forEach((entry) => {
  let date = entry.date;
  if (dateToEntryMap[date] === undefined) {
    dateToEntryMap[date] = {};
  }
  dateToEntryMap[date][entry.fips] = entry;
  generateDeltaData(date, entry.fips);
});

function getPreviousDate(date) {
  let previousDate = moment(date).subtract(1, "days");
  return previousDate.format("YYYY-MM-DD");
}

function generateDeltaData(date, countyId) {
  let currentEntry = dateToEntryMap[date][countyId] || {};
  let previousEntry =
    (dateToEntryMap[getPreviousDate(date)] || {})[countyId] || {};

  dateToEntryMap[date][countyId] = {
    ...currentEntry,
    casesDelta: currentEntry.cases - previousEntry.cases || 0,
    deathsDelta: currentEntry.deaths - previousEntry.deaths || 0,
  };
}

fs.writeFileSync(
  "../app/src/data/processed-data-per-county.json",
  JSON.stringify(dateToEntryMap)
);
