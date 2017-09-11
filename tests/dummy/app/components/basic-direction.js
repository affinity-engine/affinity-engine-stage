import Ember from 'ember';
import { DirectableComponentMixin } from 'affinity-engine-stage';

const {
  Component,
  computed,
  get
} = Ember;

const { alias } = computed;

export default Component.extend(DirectableComponentMixin, {
  hook: 'basic_direction',

  classNames: ['basic-direction'],

  configuration: alias('direction.configuration.attrs'),
  header: alias('configuration.header'),
  text: alias('configuration.text'),
  footerSecondary: alias('configuration.footerSecondary'),
  footerViaConfig: alias('configuration.footerViaConfig'),
  footerText: alias('configuration.footerText'),

  init(...args) {
    this._super(...args);

    get(this, 'direction').resolve();
  },

  footer: computed('footerSecondary', 'footerText', 'footerViaConfig', {
    get() {
      return `${get(this, 'footerText')} ${get(this, 'footerSecondary')} ${get(this, 'footerViaConfig')}`;
    }
  })
});
