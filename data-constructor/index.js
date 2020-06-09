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
const counties = require("./data/counties.json");
const countyData = require("./data/census_county.json");
let countyPopulationMap = {};

countyData.forEach(
  (county) => (countyPopulationMap[county.GEO_ID] = county.POPULATION)
);

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
  generateIncidenceData(date, entry.fips);
});

function getPreviousDate(date, unit, amount = 1) {
  let previousDate = moment(date).subtract(amount, unit);
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
  let previousWeekEntries = [0, 1, 2, 3, 4, 5, 6]
    .map(
      (i) => (dateToEntryMap[getPreviousDate(date, "days", i)] || {})[countyId]
    )
    .filter((e) => e != null);
  let casesAveragePercentGrowth_Week =
    previousWeekEntries
      .map((entry) => (entry.casesDelta / entry.cases) * 100)
      .reduce((a, b) => a + b) / previousWeekEntries.length;
  let deathsAveragePercentGrowth_Week =
    previousWeekEntries
      .map((entry) => {
        if (entry.deaths > 0) {
          return (entry.deathsDelta / entry.deaths) * 100;
        } else {
          return 0;
        }
      })
      .reduce((a, b) => a + b) / previousWeekEntries.length;

  let casesDoublingTimeDays;
  let deathsDoublingTimeDays;
  if (currentEntry.cases <= 1 || casesAveragePercentGrowth_Week === 0) {
    casesDoublingTimeDays = "N/A";
  } else {
    casesDoublingTimeDays =
      Math.round((70 / casesAveragePercentGrowth_Week) * 10) / 10;
  }
  if (currentEntry.deaths <= 1 || deathsAveragePercentGrowth_Week === 0) {
    deathsDoublingTimeDays = "N/A";
  } else {
    deathsDoublingTimeDays =
      Math.round((70 / deathsAveragePercentGrowth_Week) * 10) / 10;
  }

  dateToEntryMap[date][countyId] = {
    ...currentEntry,
    casesDoublingTimeDays,
    deathsDoublingTimeDays,
  };
}

function generateIncidenceData(date, countyId) {
  let currentEntry = dateToEntryMap[date][countyId] || {};
  let countyPopulation = countyPopulationMap[parseInt(countyId)];

  dateToEntryMap[date][countyId] = {
    ...currentEntry,
    incidence:
      Math.round((currentEntry.cases / countyPopulation) * 100000 * 100) / 100,
  };
}

fs.writeFileSync(
  "../app/src/data/dateRangeArray.json",
  JSON.stringify(Object.keys(dateToEntryMap))
);

fs.writeFileSync(
  "../app/functions/getProcessedData/processed-data-per-county.json",
  JSON.stringify(dateToEntryMap)
);

let newCountyData = { ...counties };

newCountyData.features.forEach((county) => {
  let countyId = county.properties.GEOID;
  county.properties.population = countyPopulationMap[countyId];
});

fs.writeFileSync(
  "../app/src/data/counties.json",
  JSON.stringify(newCountyData)
);
