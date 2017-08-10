import { Direction, cmd } from 'affinity-engine-stage';

export default Direction.extend({
  _configurationTiers: [
    'global',
    'component.stage',
    'component.stage.direction.appender'
  ],

  _setup: cmd(function(footerText) {
    this.link('global', { footerText });
  })
});
