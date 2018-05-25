/* globals describe, it */

const sender = require('../sender'),
    expect = require('chai').expect;

describe('chunkify', () => {
  it('breaks array into chunks', () => {
    const list = [1, 2, 3, 4, 5];
    const output = sender.chunkify(list, 2);
    expect(output.length).to.equal(3);
    expect(output[0]).to.deep.equal([1, 2]);
    expect(output[1]).to.deep.equal([3, 4]);
    expect(output[2]).to.deep.equal([5]);
  });
});

describe('loadCSV', () => {
  it('loads csv', (done) => {
    sender.loadCSV('tests/fixtures/users.csv').then((users) => {
      expect(users).to.deep.equal([
        {
          id: '1',
          email: 'u1@dev.null',
          first_name: 'first1',
          last_name: 'last1',
        },
        {
          id: '2',
          email: 'u2@dev.null',
          first_name: 'first2',
          last_name: 'last2',
        }
      ]);
      done();
    });
  });
});

describe('readFile', () => {
  it('loads file', (done) => {
    sender.readFile('tests/fixtures/subject.txt').then((data) => {
      expect(data).to.equal('Test subject');
      done();
    });
  });
});
