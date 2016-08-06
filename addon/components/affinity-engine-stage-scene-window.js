import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene-window';
import { BusSubscriberMixin } from 'ember-message-bus';
import { classNamesConfigurable, configurable, deepConfigurable } from 'affinity-engine';
import { DirectableComponentMixin } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  isPresent,
  run,
  set,
  setProperties
} = Ember;

const { RSVP: { Promise } } = Ember;
const { String: { htmlSafe } } = Ember;

const configurationTiers = [
  'directable.attrs',
  'config.attrs.component.stage.direction.scene',
  'config.attrs.component.stage',
  'config.attrs'
];

export default Component.extend(BusSubscriberMixin, DirectableComponentMixin, {
  layout,

  hook: 'affinity_engine_stage_scene_window',

  attributeBindings: ['sceneWindowId:data-scene-window-id'],
  classNames: ['ae-stage-scene-window'],

  config: multiton('affinity-engine/config', 'engineId'),

  windowClassNames: classNamesConfigurable(configurationTiers, 'classNames'),
  priority: configurable(configurationTiers, 'priority'),
  sceneId: configurable(configurationTiers, 'sceneId'),
  sceneWindowId: configurable(configurationTiers, 'sceneWindowId'),
  screen: configurable(configurationTiers, 'screen'),
  screenClassNames: classNamesConfigurable(configurationTiers, 'screen'),
  transitionIn: deepConfigurable(configurationTiers, 'transitionIn'),
  transitionOut: deepConfigurable(configurationTiers, 'transitionOut'),
  window: configurable(configurationTiers, 'window'),

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

    set(this, 'transitions', [get(this, 'transitionIn')]);
  },

  _setupEventListeners() {
    const engineId = get(this, 'engineId');
    const sceneWindowId = get(this, 'sceneWindowId');

    this.on(`ae:${engineId}:${sceneWindowId}:shouldCloseWindow`, this, this._close);
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
    new Promise((resolve) => {
      run(() => {
        setProperties(this, {
          resolve,
          transitions: [get(this, 'transitionOut')]
        });
      });
    }).then(() => {
      run(() => {
        this.removeDirectable();
      });
    });
  }
});
