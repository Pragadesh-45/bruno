const ohm = require('ohm-js');
const _ = require('lodash');
const { extractDescription } = require('./common/semantic-utils');

// Env files use 4-space indentation for multiline content
// vars {
//   API_KEY: '''
//     -----BEGIN PUBLIC KEY-----
//     MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC8
//     HMR5LXFFrwXQFE6xUVhXrxUpx1TtfoGkRcU7LEWV
//     -----END PUBLIC KEY-----
//   '''
// }
const indentLevel = 4;
const grammar = ohm.grammar(`Bru {
  BruEnvFile = (vars | secretvars | color)*

  nl = "\\r"? "\\n"
  st = " " | "\\t"
  stnl = st | nl
  tagend = nl "}"
  optionalnl = ~tagend nl
  keychar = ~(tagend | st | nl | ":") any
  valuechar = ~(nl | tagend | multilinetextblockstart) any

  multilinetextblockdelimiter = "'''"
  multilinetextblockstart = "'''" nl
  multilinetextblockend = nl st* "'''"
  multilinetextblock = multilinetextblockstart multilinetextblockcontent multilinetextblockend
  multilinetextblockcontent = (~multilinetextblockend any)*

  // Dictionary Blocks
  dictionary = st* "{" pairlist? tagend
  pairlist = optionalnl* pair (~tagend stnl* pair)* (~tagend space)*
  pair = descriptionprefix? st* key st* ":" st* value st*
  key = keychar*
  value = multilinetextblock | singlelinevalue_optdesc
  singlelinevalue_optdesc = valuechar_before_desc* (st* "@" "description" "(" "'''" descriptionTripleContent "'''" ")" st*)?
  valuechar_before_desc = ~(st* "@" "description" "(" "'''") valuechar
  descriptionTripleContent = (~"'''" any)*

  // Prefix description annotation: @description('''...''') on its own line before a key:value pair.
  // Supports multiline values (unlike the suffix form).
  // Double-quoted form is used when the description itself contains ''' (cannot embed inside triple-quoted).
  descriptionprefix = descriptionprefix_triple | descriptionprefix_double
  descriptionprefix_triple = st* "@" "description" "(" "'''" descriptionTripleContent "'''" ")" st* nl
  descriptionprefix_double = st* "@" "description" "(" "\\"" descriptionDoubleChar* "\\"" ")" st* nl
  descriptionDoubleChar = descriptionDoubleEsc | descriptionDoubleNorm
  descriptionDoubleEsc = "\\\\" any
  descriptionDoubleNorm = ~"\\"" ~nl any

  // Array Blocks
  array = st* "[" stnl* valuelist stnl* "]"
  valuelist = stnl* arrayvalue stnl* ("," stnl* arrayvalue)*
  arrayvalue = arrayvaluechar*
  arrayvaluechar = ~(nl | st | "[" | "]" | ",") any

  secretvars = "vars:secret" array
  vars = "vars" dictionary
  color = "color:" any*
}`);

const mapPairListToKeyValPairs = (pairList = []) => {
  if (!pairList.length) {
    return [];
  }

  return _.map(pairList[0], (pair) => {
    // Skip the internal __desc marker when resolving the real key name
    let name = _.keys(pair).find((k) => k !== '__desc');
    let value = pair[name];
    let enabled = true;
    if (name && name.length && name.charAt(0) === '~') {
      name = name.slice(1);
      enabled = false;
    }

    const result = {
      name,
      value,
      enabled
    };

    if (pair.__desc !== undefined) {
      // Grammar already parsed this — use it directly, no regex needed
      result.description = pair.__desc;
    } else {
      // The serializer uses double-quoted @description("...") only when the description itself
      // contains ''' (triple-quotes can't be embedded inside triple-quoted delimiters).
      // That form is not handled by the grammar rule, so regex extraction is still needed.
      extractDescription(result);
    }

    return result;
  });
};

const mapArrayListToKeyValPairs = (arrayList = []) => {
  arrayList = arrayList.filter((v) => v && v.length);

  if (!arrayList.length) {
    return [];
  }

  return _.map(arrayList, (value) => {
    let name = value;
    let enabled = true;
    if (name && name.length && name.charAt(0) === '~') {
      name = name.slice(1);
      enabled = false;
    }

    return {
      name,
      value: '',
      enabled
    };
  });
};

const concatArrays = (objValue, srcValue) => {
  if (_.isArray(objValue) && _.isArray(srcValue)) {
    return objValue.concat(srcValue);
  }
};

const sem = grammar.createSemantics().addAttribute('ast', {
  BruEnvFile(tags) {
    if (!tags || !tags.ast || !tags.ast.length) {
      return {
        variables: []
      };
    }

    return _.reduce(
      tags.ast,
      (result, item) => {
        return _.mergeWith(result, item, concatArrays);
      },
      {}
    );
  },
  array(_1, _2, _3, valuelist, _4, _5) {
    return valuelist.ast;
  },
  arrayvalue(chars) {
    return chars.sourceString ? chars.sourceString.trim() : '';
  },
  valuelist(_1, value, _2, _3, _4, rest) {
    return [value.ast, ...rest.ast];
  },
  dictionary(_1, _2, pairlist, _3) {
    return pairlist.ast;
  },
  pairlist(_1, pair, _2, rest, _3) {
    return [pair.ast, ...rest.ast];
  },
  descriptionprefix(alt) {
    return alt.ast;
  },
  descriptionprefix_triple(_st, _at, _desc, _lp, _open, descContent, _close, _rp, _st2, _nl) {
    const raw = descContent.sourceString;
    if (raw.includes('\n')) {
      return raw.split('\n').map((line) => (line.startsWith('    ') ? line.slice(4) : line)).join('\n').trim();
    }
    return raw.trim();
  },
  descriptionprefix_double(_st, _at, _desc, _lp, _dqOpen, descChars, _dqClose, _rp, _st2, _nl) {
    return descChars.sourceString.replace(/\\(\\|"|n|r|t)/g, (_, c) => {
      if (c === '\\') return '\\';
      if (c === '"') return '"';
      if (c === 'n') return '\n';
      if (c === 'r') return '\r';
      if (c === 't') return '\t';
      return c;
    });
  },
  pair(descPrefix, _1, key, _2, _3, _4, value, _5) {
    let res = {};
    const valueAst = value.ast;
    const prefixDesc = descPrefix.children.length > 0 ? descPrefix.children[0].ast : undefined;

    if (valueAst && typeof valueAst === 'object' && '__value' in valueAst) {
      res[key.ast] = valueAst.__value;
      // Prefix description takes precedence over suffix description
      res.__desc = prefixDesc !== undefined ? prefixDesc : valueAst.__desc;
      return res;
    }

    res[key.ast] = valueAst ? valueAst.trim() : '';
    if (prefixDesc !== undefined) res.__desc = prefixDesc;
    return res;
  },
  key(chars) {
    return chars.sourceString ? chars.sourceString.trim() : '';
  },
  value(chars) {
    // Delegate to the matched child's semantic action.
    // Both multilinetextblock and singlelinevalue_optdesc have their own ast actions.
    return chars.ast;
  },
  singlelinevalue_optdesc(_valueChars, _st1, _at, _descKeyword, _lp, _tripleOpen, descContent, _tripleClose, _rp, _st2) {
    const value = _valueChars.sourceString.trim();

    // descContent is an Iter: length === 1 when @description('''...''') was matched, 0 when absent.
    // Using parsed AST nodes avoids a second O(n) regex pass over the raw source string.
    if (descContent.children.length > 0) {
      const raw = descContent.children[0].sourceString;

      let description;
      if (raw.includes('\n')) {
        description = raw
          .split('\n')
          .map((line) => (line.startsWith('    ') ? line.slice(4) : line))
          .join('\n')
          .trim();
      } else {
        description = raw.trim();
      }

      // Return a tagged object so the pair action can propagate both value and description
      // without needing a second O(n) scan via extractDescription()
      return { __value: value, __desc: description };
    }

    // No triple-quoted description present.
    // The value may still carry a double-quoted @description("...") suffix — that form is not
    // covered by the grammar rule and will be handled by extractDescription() downstream.
    return value;
  },
  multilinetextblockstart(_1, _2) {
    return '';
  },
  multilinetextblockend(_1, _2, _3) {
    return '';
  },
  multilinetextblockdelimiter(_) {
    return '';
  },
  multilinetextblock(_1, content, _2) {
    return content.ast
      .split(/\r\n|\r|\n/)
      .map((line) => line.slice(indentLevel)) // Remove 4-space indentation
      .join('\n')
      .trim();
  },
  multilinetextblockcontent(chars) {
    return chars.sourceString;
  },
  nl(_1, _2) {
    return '';
  },
  st(_) {
    return '';
  },
  tagend(_1, _2) {
    return '';
  },
  _iter(...elements) {
    return elements.map((e) => e.ast);
  },
  vars(_1, dictionary) {
    const vars = mapPairListToKeyValPairs(dictionary.ast);
    _.each(vars, (v) => {
      v.secret = false;
    });
    return {
      variables: vars
    };
  },
  secretvars: (_1, array) => {
    const vars = mapArrayListToKeyValPairs(array.ast);
    _.each(vars, (v) => {
      v.secret = true;
    });
    return {
      variables: vars
    };
  },
  color: (_1, anystring) => {
    return {
      color: anystring.sourceString.trim()
    };
  }
});

const parser = (input) => {
  const match = grammar.match(input);

  if (match.succeeded()) {
    return sem(match).ast;
  } else {
    throw new Error(match.message);
  }
};

module.exports = parser;
