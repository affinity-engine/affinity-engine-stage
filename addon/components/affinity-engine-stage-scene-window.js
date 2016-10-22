import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene-window';
import { DirectableComponentMixin } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  isPresent,
  run,
  set
} = Ember;

const { String: { htmlSafe } } = Ember;
const { alias } = computed;

export default Component.extend(DirectableComponentMixin, {
  layout,

  directable: computed(() => Ember.Object.create()),

  hook: 'affinity_engine_stage_scene_window',
  attributeBindings: ['stageModalId:data-scene-window-id'],
  classNames: ['ae-stage-scene-window'],

  config: multiton('affinity-engine/config', 'engineId'),
  esmBus: multiton('message-bus', 'engineId', 'stageModalId'),

  animationLibrary: alias('directable.animationLibrary'),
  windowClassNames: alias('directable.windowClassNames'),
  priority: alias('directable.priority'),
  sceneId: alias('directable.sceneId'),
  stageModalId: alias('directable.stageModalId'),
  screen: alias('directable.screen'),
  screenClassNames: alias('directable.screenClassNames'),
  transitionIn: alias('directable.transitionIn'),
  transitionOut: alias('directable.transitionOut'),
  window: alias('directable.window'),

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
    this._setupSceneRecord();
  },

  _setupEventListeners() {
    get(this, 'esmBus').subscribe('shouldCloseWindow', this, this._close);
  },

  _setupSceneRecord() {
    const sceneRecord = get(this, 'priorSceneRecord') || {};
    const direction = get(this, 'directable.direction');

    if (isPresent(direction)) {
      set(this, 'sceneRecord', sceneRecord);
      set(direction, 'result', sceneRecord);
    }
  },

  _close() {
    run(() => {
      set(this, 'willTransitionOut', true);
    });
  },

  actions: {
    didTransitionOut() {
      this.removeDirectable();
    }
  }
});
