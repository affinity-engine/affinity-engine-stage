import { Direction, cmd } from 'affinity-engine-stage';

export default Direction.extend({
  _configurationTiers: [
    'children',
    'component.stage.all',
    'component.stage.direction.appender'
  ],

  _setup: cmd(function(footerText) {
    this.link('children', { footerText });
  })
});
