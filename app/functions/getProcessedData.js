exports.handler = function (event, context, callback) {
  // your server-side functionality
  const data = require("./processed-data-per-county.json");

  let dataToReturn = {};
  Object.keys(data).forEach((date) => {
    let dateData = {};
    Object.keys(data[date]).forEach((county) => {
      dateData[county] =
        data[date][county][event.queryStringParameters.statKey];
    });
    dataToReturn[date] = { ...dateData };
  });

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(dataToReturn),
  });
};
