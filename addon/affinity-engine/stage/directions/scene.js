import Ember from 'ember';
import { classNamesConfigurable, configurable, deepConfigurable } from 'affinity-engine';
import { Direction, cmd } from 'affinity-engine-stage';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  computed,
  get,
  getProperties,
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
    this._entryPoint();

    set(this, 'attrs.sceneId', sceneId);

    const windowId = get(this, 'windowId');

    if (windowId !== 'main') {
      this.window(windowId);
    }
  }),

  autosave: cmd(function(autosave = true) {
    this._entryPoint();

    set(this, 'attrs.autosave', autosave);
  }),

  transitionIn: cmd(function(effect, duration, options = {}) {
    this._entryPoint();

    set(this, 'attrs.transitionIn', merge({ duration, effect }, options));
  }),

  transitionOut: cmd(function(effect, duration, options = {}) {
    this._entryPoint();

    set(this, 'attrs.transitionOut', merge({ duration, effect }, options));
  }),

  window: cmd(function(sceneWindowId) {
    set(this, 'attrs.window', this);
    set(this, 'attrs.sceneWindowId', sceneWindowId);
  }),

  classNames: cmd(function(classNames) {
    this._entryPoint();

    set(this, 'attrs.classNames', classNames);
  }),

  close: cmd(function() {
    const engineId = get(this, 'engineId');
    const sceneWindowId = get(this, 'attrs.sceneWindowId');

    this.publish(`ae:${engineId}:${sceneWindowId}:shouldCloseWindow`);
  }),

  priority: cmd(function(priority) {
    this._entryPoint();

    set(this, 'attrs.priority', priority);
  }),

  screen: cmd(function(screen = true) {
    this._entryPoint();

    set(this, 'attrs.screen', screen);
  }),

  _perform(...args) {
    const { attrs, engineId, windowId } = getProperties(this, 'attrs', 'engineId', 'windowId');
    const sceneWindowId = get(attrs, 'sceneWindowId');

    if (isPresent(sceneWindowId) && sceneWindowId !== windowId) {
      return this._super(...args);
    } else if (isPresent(get(this, 'attrs.sceneId'))) {
      const sceneId = get(this, 'attrs.sceneId');

      this.publish(`ae:${engineId}:${windowId}:shouldChangeScene`, sceneId, attrs);
    }
  }
});
