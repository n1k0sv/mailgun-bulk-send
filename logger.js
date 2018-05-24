'use strict';

const _ = require('underscore');

module.exports = {
  fatal: (message) => {
    _.each(message.split('\n'), (line) => console.error(line));
    process.exit();
  },
  error: (message) => {
    _.each(message.split('\n'), (line) => console.error(line));
  },
  info: (message) => {
    _.each(message.split('\n'), (line) => console.log(line));
  },
};
