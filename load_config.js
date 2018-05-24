'use strict';

const logger = require('./logger');

// read the configuration
const config = (() => {
  try {
    return require('./config.json');
  } catch (err) {
    logger.fatal('Could not locate/read config.json');
  }
})();

function property_required(property) {
  logger.fatal([
    `Could not find "${property}" property in config.json`,
    'Hint: see config.sample.json for details'
  ].join('\n'));
}

// validate config
if (!config.mailgun) property_required('mailgun');
if (!config.mailgun.domain) property_required('mailgun.domain');
if (!config.mailgun.api_key) property_required('mailgun.api_key');
if (!config.csv_delimiter) property_required('csv_delimiter');

module.exports = config;
