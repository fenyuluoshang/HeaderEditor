import EventEmitter from 'eventemitter3';

class Emitter extends EventEmitter {
  EVENT_GROUP_UPDATE = 'a1';

  ACTION_SELECT_GROUP = 'a2';

  INNER_GROUP_SELECTED = 'a3';

  INNER_GROUP_CANCEL = 'a4';

  INNER_LOG = 'a5';

  EVENT_HAS_RULE_UPDATE = 'b1';

  EVENT_RULE_UPDATE = 'b2';

  EVENT_PREFS_UPDATE = 'b3';

  EVENT_PREFS_READY = 'b4';
}
const emitter = new Emitter();

export default emitter;
