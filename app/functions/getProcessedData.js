exports.handler = function (event, context, callback) {
  // your server-side functionality
  const data = require("./processed-data-per-county.json");

  callback(null, {
    statusCode: 200,
    body: JSON.stringify(data),
  });
};
