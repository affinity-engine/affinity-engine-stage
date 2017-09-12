import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene-window';
import { AnimatableMixin, classNames } from 'affinity-engine';
import { DirectableComponentMixin } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  run,
  set
} = Ember;

const { reads } = computed;

export default Component.extend(AnimatableMixin, DirectableComponentMixin, {
  layout,

  direction: computed(() => Ember.Object.create()),

  hook: 'affinity_engine_stage_scene_window',
  mediaElementSelector: '.ae-stage',
  attributeBindings: ['window:data-scene-window-id'],
  classNames: ['ae-stage-scene-window'],

  esmBus: multiton('message-bus', 'engineId', 'window'),

  configuration: reads('direction.configuration.attrs'),
  animator: reads('configuration.animator'),
  sceneId: reads('configuration.sceneId'),
  window: reads('configuration.window'),
  screen: reads('configuration.screen'),
  transitionIn: reads('configuration.transitionIn'),
  transitionOut: reads('configuration.transitionOut'),
  windowDirection: reads('configuration.windowDirection'),

  windowClassNames: classNames('configuration.classNames'),
  screenClassNames: classNames('screen'),

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

  didTransitionOut() {
    this.removeDirection();
  }
});
