import Ember from 'ember';
import Script from './script';
import { nativeCopy } from 'affinity-engine';

const {
  get,
  getProperties,
  typeOf
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Script.extend({
  _deepScanForAlias(object, parent, parentKey) {
    Object.keys(object).forEach((key) => {
      if (typeOf(object[key]) === 'object') this._deepScanForAlias(object[key], object, key);
      else if (key === 'alias') parent[parentKey] = get(this, `configuration.${object[key]}`)
    })
  },

  _executeDirection(directionName, args) {
    if (get(this, 'isAborted')) { return resolve(); }

    const { configuration, script } = getProperties(this, 'configuration', 'script');
    const direction = this._createDirection(directionName, script);
    const link = nativeCopy(get(configuration, 'link'));

    this._deepScanForAlias(link);

    direction._applyEngineConfig();
    direction._applyLinkedConfig(link);

    return direction._setup(...args);
  }
});
