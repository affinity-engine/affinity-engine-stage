import Ember from 'ember';
import { classNamesConfigurable, configurable, deepConfigurable } from 'affinity-engine';
import { Direction, cmd } from 'affinity-engine-stage';
import { task, timeout } from 'ember-concurrency';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  computed,
  get,
  getProperties,
  isBlank,
  isPresent,
  merge,
  set
} = Ember;

export default Direction.extend(BusPublisherMixin, {
  componentPath: 'affinity-engine-stage-scene-window',
  layer: 'windows',

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
        animationAdapter: configurable(configurationTiers, 'animationLibrary'),
        windowClassNames: classNamesConfigurable(configurationTiers, 'classNames'),
        priority: configurable(configurationTiers, 'priority'),
        sceneId: configurable(configurationTiers, 'sceneId'),
        sceneWindowId: configurable(configurationTiers, 'sceneWindowId'),
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

    const windowId = get(this, 'windowId');

    if (windowId !== 'main') {
      this.window(windowId);
    }

    get(this, '_sceneChangeTask').perform();
  }),

  _sceneChangeTask: task(function * () {
    yield timeout(10);

    const { attrs, engineId, windowId } = getProperties(this, 'attrs', 'engineId', 'windowId');
    const { sceneId, sceneWindowId } = getProperties(attrs, 'sceneId', 'sceneWindowId');

    if ((isBlank(sceneWindowId) || sceneWindowId === windowId) && isPresent(sceneId)) {
      this.publish(`ae:${engineId}:${windowId}:shouldChangeScene`, sceneId, attrs);
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

  window: cmd({ directable: true }, function(sceneWindowId) {
    set(this, 'attrs.window', this);
    set(this, 'attrs.sceneWindowId', sceneWindowId);
  }),

  classNames: cmd(function(classNames) {
    set(this, 'attrs.classNames', classNames);
  }),

  close: cmd(function() {
    const engineId = get(this, 'engineId');
    const sceneWindowId = get(this, 'attrs.sceneWindowId');

    this.publish(`ae:${engineId}:${sceneWindowId}:shouldCloseWindow`);
  }),

  priority: cmd(function(priority) {
    set(this, 'attrs.priority', priority);
  }),

  screen: cmd(function(screen = true) {
    set(this, 'attrs.screen', screen);
  })
});
