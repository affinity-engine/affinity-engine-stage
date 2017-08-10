import Ember from 'ember';
import { Direction, cmd } from 'affinity-engine-stage';

const {
  merge
} = Ember;

export default Direction.extend({
  componentPath: 'basic-direction',
  layer: 'engine.meta.basic',

  _configurationTiers: [
    'global',
    'stage',
    'basic',
    'stage.component.basic'
  ],

  _setup: cmd({ render: true, async: true }, function(header, options) {
    this.configure(merge({ header }, options));
  })
});
