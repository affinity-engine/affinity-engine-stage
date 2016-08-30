import Ember from 'ember';
import { Direction, cmd } from 'affinity-engine-stage';

const {
  set
} = Ember;

export default Direction.extend({
  _setup: cmd(function(footer) {
    set(this, 'attrs.footerText', footer);
  }),

  secondary: cmd(function(secondary) {
    set(this, 'attrs.footerSecondary', secondary);
  })
});
