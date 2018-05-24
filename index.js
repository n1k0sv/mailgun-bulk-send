'use strict';

const config = require('./load_config'),
    logger = require('./logger'),
    sender = require('./sender'),
    _ = require('underscore'),
    prompt = require('prompt');

// ------------------------------- SETUP OBJECT -------------------------------

let SETUP = {
  sender: '',
  csv: '',
  subject: '',
  html: '',
  text: '',
};

// ------------------------ READ FROM COMMAND LINE ----------------------------

// read command line arguments
const args = process.argv.slice(2);
if (_.contains(args, '-h') || _.contains(args, '--help')) {
  logger.info('npm start -- [sender="who <me@here.com>"] [csv=users.csv] [subject=subject.txt] [html=body.html] [text=body.txt]');
  process.exit();
}

_.each(args, (arg) => {
  _.each(_.keys(SETUP), (key) => {
    if (arg.indexOf(key + '=') == 0) {
      SETUP[key] = arg.substr(key.length + 1);
    }
  });
});

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

if (prompt_schema.length) {
  prompt.start();
  prompt.get(prompt_schema, (err, result) => {
    if (err) logger.fatal(err);
    SETUP = _.extendOwn(SETUP, result);
    sender(SETUP);
  });
} else sender(SETUP);
