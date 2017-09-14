const loader = require('./loader');
const parser = require('./parser');

module.exports = () => {

  const sectionState = [0, 0, 0, 0, 0, 0];
  const referenceState = {};

  const location = (ast) => {
    return {
      type: 'text',
      content: ast['$file$'],
    };
  };

  const filename = (ast) => {
    const arr = ast['$file$'].split('/')
    return {
      type: 'text',
      content: arr[arr.length - 1]
    };
  };

  const reference = (ast) => {
    const number = referenceState[ast['$file$']];
    return {
      type: 'text',
      content: number
    };
  };

  const section = (str, ast) => {
    const val = str.match(/^['"]?(.*)['"]?$/)[1];
    const split = val.split('.');
    const pos = split.length;
    for (let i = 0; i < 6; i++) {
      if (i === pos - 1) {
        sectionState[i] = sectionState[i] + 1 || 1;
      }
      if (i > pos - 1) {
        sectionState[i] = 0
      }
    }

    const number = sectionState.slice(0, pos).join('.');

    if (!referenceState[ast['$file$']]) {
      referenceState[ast['$file$']] = number;
    }

    const res = {
      type: 'text',
      content: number
    };
    return Promise.resolve(res)
  };

  const definition = (val, ast, opts) => {

    // console.log('-----', val)

    if (typeof val === 'object') {
      const ast = val;
      const definition = ast['$meta$']['Definition']
      const res = {
        type: 'htmlblock',
        content: `<a href="#${definition.replace(' ', '-')}">${definition}</a>`
      };
      return Promise.resolve(res)
    }

    if (typeof val === 'string') {
      const file = val.match(/^\[(.*)\]$/)[1];
      return loader(file, opts)
        .then((text) => {
          const ast = parser(text.data)
          const definition = ast['meta']['Definition'];

          if (!definition)
            throw new Error(`definition not found in file ${ast['$file$']}`);

          return {
            type: 'htmlblock',
            content: `<a href="#${definition.replace(' ', '-')}">${definition}</a>`
          };
        })
    }
  };

  return {location, filename, section, reference, definition};

};



