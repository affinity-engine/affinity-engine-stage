import Ember from 'ember';
import configurable from 'affinity-engine/macros/affinity-engine/configurable';
import { DirectableComponentMixin } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get
} = Ember;

const configurationTiers = [
  'directable.attrs',
  'directable.attrs.appender.attrs',
  'config.attrs.stage',
  'config.attrs.globals'
];

export default Component.extend(DirectableComponentMixin, {
  hook: 'basic_direction',

  config: multiton('affinity-engine/config', 'theaterId'),

  header: configurable(configurationTiers, 'header'),
  text: configurable(configurationTiers, 'textContent'),
  footerSecondary: configurable(configurationTiers, 'footerSecondary'),
  footerText: configurable(configurationTiers, 'footerText'),

  footer: computed('footerSecondary', 'footerText', {
    get() {
      return `${get(this, 'footerText')} ${get(this, 'footerSecondary')}`;
    }
  })
});
