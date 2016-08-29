// import { configurable } from 'affinity-engine';
import { Direction, cmd } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

export default Direction.extend({
  config: multiton('affinity-engine/config', 'engineId'),

  _configurationTiers: [
    'attrs',
    'config.attrs.component.stage.direction.<%= camelizedModuleName %>',
    'config.attrs.component.stage',
    'config.attrs'
  ],

  _directableDefinition: computed('_configurationTiers', {
    get() {
      return {

      }
    }
  }),

  _setup: cmd(function() {

  })
});
