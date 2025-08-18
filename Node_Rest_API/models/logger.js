const logger = (message) => {
  // You can expand with winston/morgan for advanced logging
  console.log(`[LOG]: ${message}`);
};

module.exports = logger;