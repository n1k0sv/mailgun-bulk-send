'use strict';

const config = require('./load_config'),
    logger = require('./logger'),
    fs = require('fs'),
    path = require('path'),
    csv_parse = require('csv-parse'),
    _ = require('underscore');

const mailgun = require('mailgun-js')({
  apiKey: config.mailgun.api_key,
  domain: config.mailgun.domain,
});

function chunkify(list, size) {
  let i, j, response = [];
  for (i = 0, j = list.length; i < j; i += size) {
    response.push(list.slice(i, i + size));
  }
  return response;
}

function loadCSV(filename) {
  return new Promise((resolve, reject) => {
    const csvData = [];
    fs.createReadStream(path.resolve(__dirname, filename)).
      pipe(csv_parse({
        columns: true, // autodiscover
        delimiter: config.csv_delimiter,
      })).on('data', function(csvrow) {
        csvData.push(csvrow);
      }).on('end', function() {
        resolve(csvData);
      });
  });
}

function readFile(filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(path.resolve(__dirname, filename), 'utf8', (err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
}

function validatePayload(payload) {
  return new Promise((resolve, reject) => {
    logger.info('Looking for empty data');
    if (payload.batch_size <= 0 || payload.batch_size > 1000) {
      return reject('Batch size must be 0-1000');
    }
    if (!payload.users.length) return reject('No users to send to');
    if (!payload.subject) return reject('Subject is required');
    if (!payload.text) return reject('Text email body is required');
    if (!payload.html) return reject('HTML email body is required');

    logger.info('Validating CSV file contents');
    var user_keys = _.keys(payload.users[0]);
    logger.info('Found user keys: ' + user_keys.join(','));
    if (!_.contains(user_keys, 'email')) {
      return reject('"email" column is required in CSV file');
    }
    if (user_keys.length == 1) {
      return reject('Unique id and other variables are required in CSV');
    }
    // look for recipient variable in html and text
    let missing = _.filter(
      (payload.html + payload.text).match(/%recipient.(.*?)%/g),
      (variable) => {
        variable = variable.replace('%recipient.', '').replace('%', '');
        return !_.contains(user_keys, variable);
      });
    if (missing.length) {
      reject('Recipient variables are missing from CSV: ' + missing.join(', '));
    }
    resolve(payload);
  });
}

function bulkSend(payload) {
  return new Promise((resolve, reject) => {
    const template = {
      from: payload.sender,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    };
    if (config.mailgun.testmode) {
      template['o:testmode'] = true;
    }
    if (config.mailgun.tags && config.mailgun.tags.length) {
      template['o:tag'] = config.mailgun.tags;
    }
    if (config.mailgun['reply-to']) {
      template['h:Reply-To'] = config.mailgun['reply-to'];
    }
    logger.info(`Splitting users to chunks of ${payload.batch_size}`);
    const chunks = chunkify(payload.users, payload.batch_size | 0);
    let index = 0, total = chunks.length;

    function process() {
      var batch = chunks.shift();
      if (!batch) return resolve();
      index++;
      logger.info(
        `\nSending batch ${index} / ${total} ` +
        `to ${batch.length} users`);

      // create a map for recipient variables
      const recvars = {};
      _.each(batch, (user) => {
        recvars[user.email] = user;
      });
      const data = _.extend({
        to: _.pluck(batch, 'email').join(', '),
        'recipient-variables': JSON.stringify(recvars),
      }, template);
      if (payload.fake) {
        logger.info('Fake send: ');
        logger.info(data);
        process();
      } else {
        mailgun.messages().send(data, (error, body) => {
          if (error) {
            logger.error('Batch failed, aborting:');
            logger.error(data);
            logger.error('First batch email was: ' + _.first(batch).email);
            logger.error('Last batch email was: ' + _.last(batch).email);
            return reject(error);
          } else {
            logger.info(body);
            process();
          }
        });
      }
    }
    process();
  });
}

function sendCampaign(SETUP) {
  const payload = {
    fake: SETUP.fake,
    batch_size: SETUP.batch_size,
    sender: SETUP.sender,
  };
  logger.info(`Reading CSV from: ${SETUP.csv}`);
  loadCSV(SETUP.csv).then((users) => {
    payload.users = users;
    logger.info(`Reading Subject from: ${SETUP.subject}`);
    return readFile(SETUP.subject);
  }).then((subject) => {
    payload.subject = subject;
    logger.info(`Reading HTML from: ${SETUP.html}`);
    return readFile(SETUP.html);
  }).then((html) => {
    payload.html = html;
    logger.info(`Reading Text from: ${SETUP.text}`);
    return readFile(SETUP.text);
  }).then((text) => {
    payload.text = text;
    return validatePayload(payload);
  }).then(() => {
    return bulkSend(payload);
  }).then((results) => {
    logger.info('Success!');
    logger.info(results);
  }).catch((err) => {
    logger.error(err);
  });
}

module.exports = {
  sendCampaign,
  // exposed here for unit testing
  bulkSend,
  validatePayload,
  readFile,
  loadCSV,
  chunkify,
};
