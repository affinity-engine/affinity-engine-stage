import Ember from 'ember';
import Script from './script';
import { deepMerge } from 'affinity-engine';

const {
  get,
  getProperties
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Script.extend({
  _executeDirection(directionName, args) {
    if (get(this, 'isAborted')) { return resolve(); }

    const { linkedConfigurations, linkedFixtures, links, script } = getProperties(this, 'linkedConfigurations', 'linkedFixtures', 'links', 'script');
    const direction = this._createDirection(directionName, script);

    deepMerge(get(direction, 'links'), links);
    deepMerge(get(direction, 'links.fixtures'), linkedFixtures);

    const directionConfigurations = get(direction, 'links.configurations');
    directionConfigurations.pushObjects(linkedConfigurations);

    return direction._setup(...args);
  }
});
