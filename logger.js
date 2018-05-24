'use strict';

const _ = require('underscore');

module.exports = {
  fatal: (message) => {
    if (typeof message === 'string') {
      _.each(message.split('\n'), (line) => console.error(line));
    } else {
      console.error(message);
    }
    process.exit();
  },
  error: (message) => {
    if (typeof message === 'string') {
      _.each(message.split('\n'), (line) => console.error(line));
    } else {
      console.error(message);
    }
  },
  info: (message) => {
    if (typeof message === 'string') {
      _.each(message.split('\n'), (line) => console.log(line));
    } else {
      console.error(message);
    }
  },
};
