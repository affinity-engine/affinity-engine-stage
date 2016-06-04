import Ember from 'ember';
import configurable from 'ember-theater/macros/ember-theater/configurable';
import { DirectableComponentMixin } from 'ember-theater-director';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get
} = Ember;

const configurationTiers = [
  'directable.attrs',
  'directable.attrs.appender.attrs',
  'config.attrs.director',
  'config.attrs.globals'
];

export default Component.extend(DirectableComponentMixin, {
  hook: 'basic_direction',

  config: multiton('ember-theater/config', 'theaterId'),

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
