import Ember from 'ember';
import layout from '../templates/components/ember-theater-director-scene-window';
import { BusSubscriberMixin } from 'ember-message-bus';
import { configurable, deepConfigurable } from 'ember-theater';
import { DirectableComponentMixin, TransitionableComponentMixin } from 'ember-theater-director';
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

const configurablePriority = [
  'directable.attrs',
  'config.attrs.director.scene',
  'config.attrs.director',
  'config.attrs.globals'
];

export default Component.extend(BusSubscriberMixin, DirectableComponentMixin, TransitionableComponentMixin, {
  layout,

  hook: 'ember_theater_director_scene_window',

  attributeBindings: ['sceneWindowId:data-scene-window-id'],
  classNames: ['et-scene-window'],

  config: multiton('ember-theater/config', 'theaterId'),

  configurableClassNames: configurable(configurablePriority, 'classNames'),
  priority: configurable(configurablePriority, 'priority'),
  sceneId: configurable(configurablePriority, 'sceneId'),
  sceneWindowId: configurable(configurablePriority, 'sceneWindowId'),
  screen: configurable(configurablePriority, 'screen'),
  transitionIn: deepConfigurable(configurablePriority, 'transitionIn'),
  transitionOut: deepConfigurable(configurablePriority, 'transitionOut'),
  window: configurable(configurablePriority, 'window'),

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
    const theaterId = get(this, 'theaterId');
    const sceneWindowId = get(this, 'sceneWindowId');

    this.on(`et:${theaterId}:${sceneWindowId}:closingWindow`, this, this.close);

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
