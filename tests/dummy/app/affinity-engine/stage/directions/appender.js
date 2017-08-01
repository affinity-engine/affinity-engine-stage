import Ember from 'ember';
import { Direction, cmd } from 'affinity-engine-stage';

const { merge } = Ember;

export default Direction.extend({
  _configurationTiers: [
    'instanceConfig',
    'links.configurations.@each',
    'config.attrs.component.stage.direction.appender',
    'config.attrs.component.stage',
    'config.attrs.globals'
  ],

  _setup: cmd(function(footerText, options) {
    this.configure(merge({ footerText}, options));
  })
});
