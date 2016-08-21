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

  header: alias('directable.header'),
  text: alias('directable.text'),
  footerSecondary: alias('directable.footerSecondary'),
  footerText: alias('directable.footerText'),

  footer: computed('footerSecondary', 'footerText', {
    get() {
      return `${get(this, 'footerText')} ${get(this, 'footerSecondary')}`;
    }
  })
});
