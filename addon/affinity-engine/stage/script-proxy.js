import Ember from 'ember';
import Script from './script';
import { nativeCopy } from 'affinity-engine';

const {
  get,
  getProperties
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Script.extend({
  _executeDirection(directionName, args) {
    if (get(this, 'isAborted')) { return resolve(); }

    const { configuration, script } = getProperties(this, 'configuration', 'script');
    const direction = this._createDirection(directionName, script);
    const link = nativeCopy(get(configuration, 'link'));

    direction._applyEngineConfig();
    direction._applyLinkedConfig(link);

    return direction._setup(...args);
  }
});
