import Ember from 'ember';
import { classNamesConfigurable, configurable, deepConfigurable } from 'affinity-engine';
import { Direction, cmd } from 'affinity-engine-stage';
import { task, timeout } from 'ember-concurrency';
import multiton from 'ember-multiton-service';

const {
  computed,
  get,
  getProperties,
  isBlank,
  isPresent,
  merge,
  set
} = Ember;

export default Direction.extend({
  componentPath: 'affinity-engine-stage-scene-window',
  layer: 'windows',

  esBus: multiton('message-bus', 'engineId', 'stageId'),
  esmBus: multiton('message-bus', 'engineId', 'stageModalId'),

  _configurationTiers: [
    'attrs',
    'config.attrs.component.stage.direction.scene',
    'config.attrs.component.stage',
    'config.attrs'
  ],

  _directableDefinition: computed('_configurationTiers', {
    get() {
      const configurationTiers = get(this, '_configurationTiers');

      return {
        animationLibrary: configurable(configurationTiers, 'animationLibrary'),
        windowClassNames: classNamesConfigurable(configurationTiers, 'classNames'),
        priority: configurable(configurationTiers, 'priority'),
        sceneId: configurable(configurationTiers, 'sceneId'),
        stageModalId: configurable(configurationTiers, 'stageModalId'),
        screen: configurable(configurationTiers, 'screen'),
        screenClassNames: classNamesConfigurable(configurationTiers, 'screen'),
        transitionIn: deepConfigurable(configurationTiers, 'transitionIn'),
        transitionOut: deepConfigurable(configurationTiers, 'transitionOut'),
        window: configurable(configurationTiers, 'window')
      }
    }
  }),

  _setup: cmd(function(sceneId) {
    set(this, 'attrs.sceneId', sceneId);

    const stageId = get(this, 'stageId');

    if (stageId !== 'main') {
      this.window(stageId);
    }

    get(this, '_sceneChangeTask').perform();
  }),

  _sceneChangeTask: task(function * () {
    yield timeout(10);

    const { attrs, stageId } = getProperties(this, 'attrs', 'stageId');
    const { sceneId, stageModalId } = getProperties(attrs, 'sceneId', 'stageModalId');

    if ((isBlank(stageModalId) || stageModalId === stageId) && isPresent(sceneId)) {
      get(this, 'esBus').publish('shouldChangeScene', sceneId, attrs);
    }
  }),

  autosave: cmd(function(autosave = true) {
    set(this, 'attrs.autosave', autosave);
  }),

  transitionIn: cmd(function(effect, duration, options = {}) {
    set(this, 'attrs.transitionIn', merge({ duration, effect }, options));
  }),

  transitionOut: cmd(function(effect, duration, options = {}) {
    set(this, 'attrs.transitionOut', merge({ duration, effect }, options));
  }),

  window: cmd({ directable: true }, function(stageModalId) {
    set(this, 'attrs.window', this);
    set(this, 'attrs.stageModalId', stageModalId);
    set(this, 'stageModalId', stageModalId);
  }),

  classNames: cmd(function(classNames) {
    set(this, 'attrs.classNames', classNames);
  }),

  close: cmd(function() {
    get(this, 'esmBus').publish('shouldCloseWindow');
  }),

  priority: cmd(function(priority) {
    set(this, 'attrs.priority', priority);
  }),

  screen: cmd(function(screen = true) {
    set(this, 'attrs.screen', screen);
  })
});
