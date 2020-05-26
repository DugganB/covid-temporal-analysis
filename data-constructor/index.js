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
  generateDoublingData(date, entry.fips);
});

function getPreviousDate(date, unit) {
  let previousDate = moment(date).subtract(1, unit);
  return previousDate.format("YYYY-MM-DD");
}

function generateDeltaData(date, countyId) {
  let currentEntry = dateToEntryMap[date][countyId] || {};
  let previousEntry =
    (dateToEntryMap[getPreviousDate(date, "days")] || {})[countyId] || {};

  dateToEntryMap[date][countyId] = {
    ...currentEntry,
    casesDelta: currentEntry.cases - (previousEntry.cases || 0),
    deathsDelta: currentEntry.deaths - (previousEntry.deaths || 0),
  };
}

function generateDoublingData(date, countyId) {
  // Using a 7 day window to calculate the doubling time of cases/deaths
  let currentEntry = dateToEntryMap[date][countyId] || {};
  let previousWeekEntry =
    (dateToEntryMap[getPreviousDate(date, "weeks")] || {})[countyId] || {};
  let casesWeekDoublingRatio;
  if (previousWeekEntry.cases !== undefined) {
    casesWeekDoublingRatio =
      (currentEntry.cases - previousWeekEntry.cases) / previousWeekEntry.cases;
  } else {
    casesWeekDoublingRatio = 0;
  }
  dateToEntryMap[date][countyId] = {
    ...currentEntry,
    casesDoublingTimeDays: (70 / (casesWeekDoublingRatio * 100)) * 7,
  };
}

fs.writeFileSync(
  "../app/src/data/processed-data-per-county.json",
  JSON.stringify(dateToEntryMap)
);
