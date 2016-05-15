import Ember from 'ember';
import configurable from 'ember-theater/macros/ember-theater/configurable';
import DirectableComponentMixin from 'ember-theater-director/mixins/ember-theater/director/directable-component';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get
} = Ember;

const configurablePriority = [
  'directable.attrs',
  'directable.attrs.footer',
  'config.attrs.director',
  'config.attrs.globals'
];

export default Component.extend(DirectableComponentMixin, {
  hook: 'test_direction',

  config: multiton('ember-theater/config', 'theaterId'),

  header: configurable(configurablePriority, 'header'),
  text: configurable(configurablePriority, 'textContent'),
  footerSecondary: configurable(configurablePriority, 'footerSecondary'),
  footerText: configurable(configurablePriority, 'footerText'),

  footer: computed('footerMultiple', 'footerText', {
    get() {
      return `${get(this, 'footerText')} ${get(this, 'footerSecondary')}`;
    }
  })
});
