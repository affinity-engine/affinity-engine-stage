import Ember from 'ember';
import Script from './script';

const {
  assign,
  get,
  getProperties,
  set
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Script.extend({
  _executeDirection(directionName, args) {
    if (get(this, 'isAborted')) { return resolve(); }

    const { linkedAttrs, links, script } = getProperties(this, 'linkedAttrs', 'links', 'script');
    const direction = this._createDirection(directionName, script);

    assign(get(direction, 'links'), links);
    set(direction, 'links.attrs', linkedAttrs);

    return direction._setup(...args);
  }
});
