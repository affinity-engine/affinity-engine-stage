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

    const { linkedAttrs, linkedFixtures, links, script } = getProperties(this, 'linkedAttrs', 'linkedFixtures', 'links', 'script');
    const direction = this._createDirection(directionName, script);

    assign(get(direction, 'links'), links);
    assign(get(direction, 'links.attrs'), linkedAttrs);
    assign(get(direction, 'links.fixtures'), linkedFixtures);

    return direction._setup(...args);
  }
});
