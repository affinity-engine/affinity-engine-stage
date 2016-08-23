import Ember from 'ember';
import { configurable } from 'affinity-engine';
import { Direction } from 'affinity-engine-stage';

const {
  computed,
  get,
  getProperties,
  set
} = Ember;

export default Direction.extend({
  componentPath: 'basic-direction',
  layer: 'engine.meta.basic',

  _configurationTiers: [
    'attrs',
    'attrs.appender.attrs',
    'config.attrs.stage',
    'config.attrs.globals'
  ],

  _directableDefinition: computed('_configurationTiers', {
    get() {
      const configurationTiers = get(this, '_configurationTiers');

      return {
        header: configurable(configurationTiers, 'header'),
        text: configurable(configurationTiers, 'textContent'),
        footerSecondary: configurable(configurationTiers, 'footerSecondary'),
        footerText: configurable(configurationTiers, 'footerText')
      }
    }
  }),

  _setup(header) {
    this._entryPoint();

    set(this, 'attrs.header', header);
    set(this, 'attrs.appender', get(this, 'predecessors').findBy('directionName', 'appender'));

    return this;
  },

  _reset() {
    const attrs = get(this, 'attrs');

    return this._super(getProperties(attrs, 'header', 'footer'));
  },

  text(textContent) {
    this._entryPoint();

    set(this, 'attrs.textContent', textContent);

    return this;
  }
});
