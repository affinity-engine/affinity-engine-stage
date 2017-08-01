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

  header: alias('direction.configuration.header'),
  text: alias('direction.configuration.text'),
  footerSecondary: alias('direction.configuration.footerSecondary'),
  footerText: alias('direction.configuration.footerText'),

  init(...args) {
    this._super(...args);

    get(this, 'direction').resolve();
  },

  footer: computed('footerSecondary', 'footerText', {
    get() {
      return `${get(this, 'footerText')} ${get(this, 'footerSecondary')}`;
    }
  })
});
