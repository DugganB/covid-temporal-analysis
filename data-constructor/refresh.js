#!/usr/bin/env node

const fs = require("fs");
const axios = require("axios");
const util = require("util");
const csv = require("csvtojson");
const fs_writeFile = util.promisify(fs.writeFile);

let CSVDataPath = "./data/NYT_county.csv";

axios
  .get(
    "https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv"
  )
  .then((response) => {
    return fs_writeFile(CSVDataPath, response.data);
  })
  .then((response) => {
    return csv().fromFile(CSVDataPath);
  })
  .then((json) => {
    console.log(json);
    return fs_writeFile("./data/us-counties.json", JSON.stringify(json));
  });
