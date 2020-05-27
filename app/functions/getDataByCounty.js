exports.handler = function (event, context, callback) {
  // your server-side functionality
  const data = require("./processed-data-per-county.json");

  let dataToReturn = {};
  Object.keys(data).forEach((date) => {
    dataToReturn[date] = {
      ...data[date][event.queryStringParameters.countyId],
    };
  });

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(dataToReturn),
  });
};
