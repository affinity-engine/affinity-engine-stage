import Ember from 'ember';
import { configurable } from 'affinity-engine';
import { Direction, cmd } from 'affinity-engine-stage';

const {
  computed,
  get,
  set
} = Ember;

export default Direction.extend({
  _configurationTiers: [
    'attrs',
    'links.attrs',
    'config.attrs.component.stage.direction.appender',
    'config.attrs.component.stage',
    'config.attrs.globals'
  ],

  _directableDefinition: computed('_configurationTiers', {
    get() {
      const configurationTiers = get(this, '_configurationTiers');

      return {
        footerSecondary: configurable(configurationTiers, 'footerSecondary'),
        text: configurable(configurationTiers, 'text')
      }
    }
  }),

  _setup: cmd(function(text) {
    set(this, 'attrs.text', text);
  }),

  secondary: cmd(function(secondary) {
    set(this, 'attrs.footerSecondary', secondary);
  })
});
