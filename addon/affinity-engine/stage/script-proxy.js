import Ember from 'ember';
import Script from './script';
import { nativeCopy } from 'affinity-engine';

const {
  get,
  getProperties,
  set,
  typeOf
} = Ember;

const { RSVP: { resolve } } = Ember;

export default Script.extend({
  _deepScanForAlias(object, parent, parentKey) {
    Object.keys(object).forEach((key) => {
      if (typeOf(object[key]) === 'object') this._deepScanForAlias(object[key], object, key);
      else if (key === 'alias') parent[parentKey] = get(this, `configuration.attrs.${object[key]}`)
    })
  },

  _executeDirection(directionName, args) {
    if (get(this, 'isAborted')) { return resolve(); }

    const { configuration, linkedDirections, script } = getProperties(this, 'configuration', 'linkedDirections', 'script');
    const direction = this._createDirection(directionName, script);
    const links = nativeCopy(get(configuration, 'links'));

    set(direction, 'linkedDirections', linkedDirections);

    this._deepScanForAlias(links);

    direction._applyEngineConfig();
    direction._applyLinkedConfig(links);

    return direction._setup(...args);
  }
});
