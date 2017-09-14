const find = require('./find');

function bind(ast) {

  if (!ast.vars)
    return ast;

  ast.vars.forEach(function (x) {

    // console.log(x.type, x.name, x.value)

    const from = find(x.name, ast);

    if (x.type === 'string') {
      from.type = x.type;
      from.data = x.data;
      return;
    }

    if (x.type === 'variable') {
      const to = find(x.data, ast);
      from.type = to.type
      if( to.type === 'string'){
        from.data = to.data.replace(/\{\{([^}]*)\}\}/g, (match, variable) =>{
          const split = x.data.split('.');
          const res = split.slice(0, split.length - 1).concat(variable).join('.');
          return `{{${res}}}`;
        })
      }else{
        from.data = to.data
      }
      return;
    }

    if (x.type === 'link') {
      if (from.data && from.data.type === 'schema') {
        x.data['$schema$'] = from.data.data
      }
      from.data = x.data
      bind(x.data);
      return;
    }

    if (x.type === 'function') {
      const MATCH_FUNCTION = /^(.*)\((.*)\)$/;
      const match = x.data.match(MATCH_FUNCTION)
      const func = match[1];
      const args = match[2] ? match[2].split(",") : [];
      const input = args.map(x => find(x, ast)).map(x => x.data)
      const val = find(func, ast);
      const data = val.data.data.apply({}, input)
      from.data = data
      return;
    }

  });

  ast.vars.forEach(function (x) {

    if (x.type === 'link') {
      bind(x.data)
    }

  });

  return ast


}

module.exports = bind;