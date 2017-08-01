import Ember from 'ember';
import { Direction, cmd } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  computed,
  get,
  isBlank,
  isPresent,
  merge
} = Ember;

const { reads } = computed;

export default Direction.extend({
  componentPath: 'affinity-engine-stage-scene-window',
  layer: 'windows',

  esBus: multiton('message-bus', 'engineId', 'stageId'),
  esmBus: multiton('message-bus', 'engineId', 'window'),

  window: reads('instanceConfig.window'),

  _configurationTiers: [
    'instanceConfig',
    'config.attrs.component.stage.direction.scene',
    'config.attrs.component.stage',
    'config.attrs.global'
  ],

  _setup: cmd(function(sceneId, options) {
    this.configure(merge({
      sceneId,
      windowDirection: this
    }, options));

    const stageId = get(this, 'stageId');

    if (stageId !== 'main') {
      this.configure('window', stageId);
    }

    const window = get(this, 'window');

    if (isPresent(window)) this.render();

    if ((isBlank(window) || window === stageId) && isPresent(sceneId)) {
      get(this, 'esBus').publish('shouldChangeScene', sceneId, this.getConfiguration());
    }
  }),

  close: cmd(function() {
    get(this, 'esmBus').publish('shouldCloseWindow');
  })
});
