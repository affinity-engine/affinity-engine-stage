import Ember from 'ember';
import Script from './script';

const {
  assign,
  get,
  getProperties
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Script.extend({
  _executeDirection(directionName, args) {
    if (get(this, 'isAborted')) { return resolve(); }

    const { links, script } = getProperties(this, 'links', 'script');
    const direction = this._createDirection(directionName, script);

    assign(get(direction, 'links'), links);

    return direction._setup(...args);
  }
});
