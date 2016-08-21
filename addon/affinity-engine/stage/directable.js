import Ember from 'ember';
import multiton from 'ember-multiton-service';

const {
  computed,
  get
} = Ember;

export default Ember.Object.extend({
  config: multiton('affinity-engine/config', 'engineId'),

  layer: computed('options.layer', {
    get() {
      return get(this, 'options.layer') || 'engine';
    }
  })
});
