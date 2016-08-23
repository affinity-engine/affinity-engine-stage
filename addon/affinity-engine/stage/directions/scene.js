import Ember from 'ember';
import { classNamesConfigurable, configurable, deepConfigurable } from 'affinity-engine';
import { Direction } from 'affinity-engine-stage';
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

  _setup(sceneId) {
    this._entryPoint();

    set(this, 'attrs.sceneId', sceneId);

    const windowId = get(this, 'windowId');

    if (windowId !== 'main') {
      this.window(windowId);
    }

    return this;
  },

  _reset() {
    const attrs = get(this, 'attrs');

    return this._super(getProperties(attrs, 'sceneWindowId', 'window'));
  },

  autosave(autosave = true) {
    this._entryPoint();

    set(this, 'attrs.autosave', autosave);

    return this;
  },

  transitionIn(effect, duration, options = {}) {
    this._entryPoint();

    set(this, 'attrs.transitionIn', merge({ duration, effect }, options));

    return this;
  },

  transitionOut(effect, duration, options = {}) {
    this._entryPoint();

    set(this, 'attrs.transitionOut', merge({ duration, effect }, options));

    return this;
  },

  window(sceneWindowId) {
    set(this, 'attrs.window', this);
    set(this, 'attrs.sceneWindowId', sceneWindowId);

    return this;
  },

  classNames(classNames) {
    this._entryPoint();

    set(this, 'attrs.classNames', classNames);

    return this;
  },

  close() {
    const engineId = get(this, 'engineId');
    const sceneWindowId = get(this, 'attrs.sceneWindowId');

    this.publish(`ae:${engineId}:${sceneWindowId}:shouldCloseWindow`);

    return this;
  },

  priority(priority) {
    this._entryPoint();

    set(this, 'attrs.priority', priority);

    return this;
  },

  screen(screen = true) {
    this._entryPoint();

    set(this, 'attrs.screen', screen);

    return this;
  },

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
