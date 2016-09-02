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
    'config.attrs.stage',
    'config.attrs.globals'
  ],

  _linkedAttrs: [
    'footerSecondary',
    'footerText'
  ],

  _directableDefinition: computed('_configurationTiers', {
    get() {
      const configurationTiers = get(this, '_configurationTiers');

      return {
        footerSecondary: configurable(configurationTiers, 'footerSecondary'),
        footerText: configurable(configurationTiers, 'footerText'),
        text: configurable(configurationTiers, 'text')
      }
    }
  }),

  _setup: cmd(function(footer) {
    set(this, 'attrs.footerText', footer);
    set(this, 'attrs.text', footer);
  }),

  secondary: cmd(function(secondary) {
    set(this, 'attrs.footerSecondary', secondary);
  })
});
