import Ember from 'ember';
import { Direction, cmd } from 'affinity-engine-stage';

const {
  merge
} = Ember;

export default Direction.extend({
  componentPath: 'basic-direction',

  _configurationTiers: [
    'all',
    'component.stage.all',
    'basic',
    'component.stage.direction.basic'
  ],

  _setup: cmd({ render: true, async: true }, function(header, options) {
    this.configure(merge({ header }, options));
  })
});
