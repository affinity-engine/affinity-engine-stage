import { Direction, cmd } from 'affinity-engine-stage';

export default Direction.extend({
  _configurationTiers: [
    'all',
    'component.stage.all',
    'component.stage.direction.appender'
  ],

  _setup: cmd(function(footerText) {
    this.link('all', { footerText });
  })
});
