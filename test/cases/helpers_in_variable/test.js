const url = require('path');
const assert = require('assert');
const cmacc = require('../../../src/index');

describe('helpers_in_variable', function () {

  global.fs = require('fs');
  global.fetch = require('node-fetch');

  it('HelloWordSection', function (done) {
    const file = url.join('file://', __dirname, './HelloWordSection.cmacc');

    cmacc.compile(file)
      .then(ast => {
        return ast;
      })
      .then(cmacc.render)
      .then(x => {
        return cmacc.remarkable.render(x)
      })
      .then(html => {
        const expect = `<h1>Section 1</h1>
<h1>Section 1</h1>
<h1>Section 1</h1>`;

        assert.equal(html.replace(/\s/g, ''), expect.replace(/\s/g, ''));
        done();
      })
      .catch(done);

  });

});