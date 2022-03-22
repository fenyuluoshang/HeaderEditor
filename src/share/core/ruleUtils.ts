import { getDomain } from './utils';
import { InitdRule, isTinyRule, IS_MATCH, Rule, TABLE_NAMES, TinyRule } from './var';

export function initRule(rule: Rule): InitdRule {
  const inited: any = { ...rule };
  if (inited.isFunction) {
    // @ts-ignore
    // tslint:disable-next-line
    inited._func = new Function('val', 'detail', inited.code);
  }
  // Init regexp
  if (inited.matchType === 'regexp') {
    inited._reg = new RegExp(inited.pattern, 'g');
  }
  if (typeof inited.exclude === 'string' && inited.exclude.length > 0) {
    inited._exclude = new RegExp(inited.exclude);
  }
  return inited;
}

export function createExport(arr: { [key: string]: Array<Rule | InitdRule> }) {
  const result: { [key: string]: TinyRule[] } = {};
  // tslint:disable-next-line
  for (const k in arr) {
    result[k] = arr[k].map(e => convertToTinyRule(e));
  }
  return result;
}

export function convertToRule(rule: InitdRule | Rule): Rule {
  const item = { ...rule };
  // eslint-disable-next-line no-underscore-dangle
  delete item._reg;
  // eslint-disable-next-line no-underscore-dangle
  delete item._func;
  // eslint-disable-next-line no-underscore-dangle
  delete item._v_key;
  return item;
}

export function convertToTinyRule(rule: InitdRule | Rule | TinyRule): TinyRule {
  if (isTinyRule(rule)) {
    return rule;
  }
  const item = convertToRule(rule);
  // @ts-ignore
  delete item.id;
  return item;
}

export function fromJson(str: string) {
  const list: { [key: string]: Rule[] } = JSON.parse(str);
  TABLE_NAMES.forEach(e => {
    if (list[e]) {
      list[e].map(ee => {
        // @ts-ignore
        // eslint-disable-next-line no-param-reassign
        delete ee.id;
        return upgradeRuleFormat(ee);
      });
    }
  });
  return list;
}

export function upgradeRuleFormat(s: any) {
  if (typeof s.matchType === 'undefined') {
    s.matchType = s.type;
    delete s.type;
  }
  if (typeof s.isFunction === 'undefined') {
    s.isFunction = false;
  } else {
    s.isFunction = !!s.isFunction;
  }
  if (typeof s.enable === 'undefined') {
    s.enable = true;
  } else {
    s.enable = !!s.enable;
  }
  if ((s.ruleType === 'modifySendHeader' || s.ruleType === 'modifyReceiveHeader') && !s.isFunction) {
    s.action.name = s.action.name.toLowerCase();
  }
  return s;
}

export function isMatchUrl(rule: InitdRule, url: string): IS_MATCH {
  let result = false;
  switch (rule.matchType) {
    case 'all':
      result = true;
      break;
    case 'regexp':
      rule._reg.lastIndex = 0;
      result = rule._reg.test(url);
      break;
    case 'prefix':
      result = url.indexOf(rule.pattern) === 0;
      break;
    case 'domain':
      result = getDomain(url) === rule.pattern;
      break;
    case 'url':
      result = url === rule.pattern;
      break;
    default:
      break;
  }
  if (result) {
    return rule._exclude ? (rule._exclude.test(url) ? IS_MATCH.MATCH_BUT_EXCLUDE : IS_MATCH.MATCH) : IS_MATCH.MATCH;
  }
  return IS_MATCH.NOT_MATCH;
}
