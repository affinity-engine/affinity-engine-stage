import Ember from 'ember';
import { Direction } from 'ember-theater-director';

const {
  on,
  set
} = Ember;

export default Direction.extend({
  _setup(footer) {
    this._entryPoint();

    set(this, 'attrs.footerText', footer);

    return this;
  },

  secondary(secondary) {
    set(this, 'attrs.footerSecondary', secondary);

    return this;
  },

  removeFromQueue: on('willChainDirection', function(name) {
    if (name === 'basic') {
      this._removeFromQueue();
    }
  })
});
