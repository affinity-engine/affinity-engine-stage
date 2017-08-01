import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene-window';
import { DirectableComponentMixin } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  run,
  set
} = Ember;

const { String: { htmlSafe } } = Ember;
const { reads } = computed;

export default Component.extend(DirectableComponentMixin, {
  layout,

  direction: computed(() => Ember.Object.create()),

  hook: 'affinity_engine_stage_scene_window',
  attributeBindings: ['window:data-scene-window-id'],
  classNames: ['ae-stage-scene-window'],

  esmBus: multiton('message-bus', 'engineId', 'window'),

  configuration: reads('direction.configuration'),
  animationLibrary: reads('configuration.animationLibrary'),
  windowClassNames: reads('configuration.windowClassNames'),
  priority: reads('configuration.priority'),
  sceneId: reads('configuration.sceneId'),
  window: reads('configuration.window'),
  screen: reads('configuration.screen'),
  screenClassNames: reads('configuration.screenClassNames'),
  transitionIn: reads('configuration.transitionIn'),
  transitionOut: reads('configuration.transitionOut'),
  windowDirection: reads('configuration.windowDirection'),

  childStyle: computed('priority', {
    get() {
      const priorityMultiplier = 1000;
      const priority = get(this, 'priority') * priorityMultiplier;

      return htmlSafe(`z-index: ${priority};`);
    }
  }).readOnly(),

  init(...args) {
    this._super(...args);
    this._setupEventListeners();
  },

  _setupEventListeners() {
    get(this, 'esmBus').subscribe('shouldCloseWindow', this, this._close);
  },

  _close() {
    run(() => {
      set(this, 'willTransitionOut', true);
    });
  },

  actions: {
    didTransitionOut() {
      this.removeDirection();
    }
  }
});
