import Ember from 'ember';
import { Direction, cmd } from 'affinity-engine-stage';

const {
  on,
  set
} = Ember;

export default Direction.extend({
  _setup: cmd(function(footer) {
    this._entryPoint();

    set(this, 'attrs.footerText', footer);
  }),

  secondary: cmd(function(secondary) {
    set(this, 'attrs.footerSecondary', secondary);
  }),

  removeFromQueue: on('willChainDirection', function(name) {
    if (name === 'basic') {
      this._removeFromQueue();
    }
  })
});
