import Ember from 'ember';
import { configurable } from 'affinity-engine';
import { Direction, cmd } from 'affinity-engine-stage';

const {
  computed,
  get,
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

  _setup: cmd(function(header) {
    this._entryPoint();

    set(this, 'attrs.header', header);
    set(this, 'attrs.appender', get(this, 'predecessors').findBy('directionName', 'appender'));
  }),

  text: cmd(function(textContent) {
    this._entryPoint();

    set(this, 'attrs.textContent', textContent);
  })
});
