import Ember from 'ember';
import layout from '../templates/components/affinity-engine-stage-scene-window';
import { BusSubscriberMixin } from 'ember-message-bus';
import { configurable, deepConfigurable } from 'affinity-engine';
import { DirectableComponentMixin, TransitionableComponentMixin } from 'affinity-engine-stage';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  isPresent,
  run,
  set,
  typeOf
} = Ember;

const configurationTiers = [
  'directable.attrs',
  'config.attrs.stage.scene',
  'config.attrs.stage',
  'config.attrs.globals'
];

export default Component.extend(BusSubscriberMixin, DirectableComponentMixin, TransitionableComponentMixin, {
  layout,

  hook: 'affinity_engine_stage_scene_window',

  attributeBindings: ['sceneWindowId:data-scene-window-id'],
  classNames: ['et-scene-window'],

  config: multiton('affinity-engine/config', 'engineId'),

  configurableClassNames: configurable(configurationTiers, 'classNames'),
  priority: configurable(configurationTiers, 'priority'),
  sceneId: configurable(configurationTiers, 'sceneId'),
  sceneWindowId: configurable(configurationTiers, 'sceneWindowId'),
  screen: configurable(configurationTiers, 'screen'),
  transitionIn: deepConfigurable(configurationTiers, 'transitionIn'),
  transitionOut: deepConfigurable(configurationTiers, 'transitionOut'),
  window: configurable(configurationTiers, 'window'),

  joinedConfigurableClassNames: computed('configurableClassNames.[]', {
    get() {
      const classNames = get(this, 'configurableClassNames');

      return typeOf(classNames) === 'array' ? classNames.join(' ') : classNames;
    }
  }).readOnly(),

  joinedScreenClassNames: computed('screen.[]', {
    get() {
      const classNames = get(this, 'screen');

      return typeOf(classNames) === 'array' ? classNames.join(' ') : classNames;
    }
  }).readOnly(),

  childStyle: computed('priority', {
    get() {
      const priorityMultiplier = 1000;
      const priority = get(this, 'priority') * priorityMultiplier;

      return `z-index: ${priority};`;
    }
  }).readOnly(),

  init() {
    const engineId = get(this, 'engineId');
    const sceneWindowId = get(this, 'sceneWindowId');

    this.on(`et:${engineId}:${sceneWindowId}:closingWindow`, this, this.close);

    this._super();
  },

  didReceiveAttrs() {
    const sceneRecord = get(this, 'priorSceneRecord') || {};
    const direction = get(this, 'directable.direction');

    if (isPresent(direction)) {
      set(this, 'sceneRecord', sceneRecord);
      set(direction, 'result', sceneRecord);
    }

    this._super();
  },

  didInsertElement() {
    this.executeTransitionIn().then(() => {
      run(() => {
        this.resolve();
      });
    });

    this._super();
  },

  close() {
    this.executeTransitionOut().then(() => {
      run(() => {
        this.removeDirectable();
      });
    });
  }
});