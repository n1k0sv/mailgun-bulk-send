'use strict';

const config = require('./load_config'),
    logger = require('./logger'),
    sendCampaign = require('./sender').sendCampaign,
    _ = require('underscore'),
    prompt = require('prompt');

// ------------------------------- SETUP OBJECT -------------------------------

let SETUP = {
  sender: '',
  csv: '',
  subject: '',
  html: '',
  text: '',
  batch_size: 0,
  fake: true,
};

// ------------------------ READ FROM COMMAND LINE ----------------------------

// read command line arguments
const args = process.argv.slice(2);
if (_.contains(args, '-h') || _.contains(args, '--help')) {
  logger.info([
    'npm start -- ',
    '[sender="who <me@here.com>"]',
    '[csv=users.csv]',
    '[subject=subject.txt]',
    '[html=body.html]',
    '[text=body.txt]',
    '[batch_size=1000]',
    '[--sendit]'
  ].join('\n  '));
  process.exit();
}

if (_.contains(args, '--sendit')) {
  SETUP.fake = false;
}

_.each(args, (arg) => {
  _.each(_.keys(SETUP), (key) => {
    if (arg.indexOf(key + '=') == 0) {
      SETUP[key] = arg.substr(key.length + 1);
    }
  });
});
SETUP.batch_size = SETUP.batch_size | 0;

if (SETUP.fake) {
  logger.info(
    'FAKE MODE: No email will be sent unless you specify the ' +
    '--sendit command line argument');
} else {
  logger.info(
    'REAL MODE: Emails will actually be sent!');
}

// ------------------------ PROMPT FOR INPUT ----------------------------

// for those arguments that were not provided through the command line
// prompt for input
let prompt_schema = [];
if (!SETUP.sender) {
  prompt_schema.push({
    name: 'sender',
    description: 'Enter email sender',
    required: false,
    default: config.mailgun.sender,
  });
}
if (!SETUP.csv) {
  prompt_schema.push({
    name: 'csv',
    description: 'Path to CSV file',
    required: true,
  });
}
if (!SETUP.subject) {
  prompt_schema.push({
    name: 'subject',
    description: 'Path to subject txt file',
    required: true,
  });
}
if (!SETUP.html) {
  prompt_schema.push({
    name: 'html',
    description: 'Path to html body file',
    required: true,
  });
}
if (!SETUP.text) {
  prompt_schema.push({
    name: 'text',
    description: 'Path to text body file',
    required: true,
  });
}
if (!SETUP.batch_size) {
  prompt_schema.push({
    name: 'batch_size',
    description: 'Batch size (default 1)',
    required: false,
    default: 1,
  });
}

if (prompt_schema.length) {
  prompt.start();
  prompt.get(prompt_schema, (err, result) => {
    if (err) logger.fatal(err);
    SETUP = _.extendOwn(SETUP, result);
    sendCampaign(SETUP);
  });
} else sendCampaign(SETUP);
