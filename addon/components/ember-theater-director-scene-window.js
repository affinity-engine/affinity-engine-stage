import Ember from 'ember';
import layout from '../templates/components/ember-theater-director-scene-window';
import { BusSubscriberMixin } from 'ember-message-bus';
import DirectableComponentMixin from 'ember-theater-director/mixins/ember-theater/director/directable-component';
import TransitionMixin from 'ember-theater-director/mixins/ember-theater/director/transition';
import multiton from 'ember-multiton-service';
import configurable, { deepConfigurable } from 'ember-theater/macros/ember-theater/configurable';

const {
  Component,
  computed,
  get,
  isNone,
  on,
  set,
  typeOf
} = Ember;

const configurablePriority = [
  'directable.attrs',
  'config.attrs.director.scene',
  'config.attrs.director',
  'config.attrs.globals'
];

export default Component.extend(BusSubscriberMixin, DirectableComponentMixin, TransitionMixin, {
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

  childStyle: computed('priority', {
    get() {
      const priorityMultiplier = 1000;
      const priority = get(this, 'priority') * priorityMultiplier;

      return `z-index: ${priority};`;
    }
  }).readOnly(),

  setupEvents: on('init', function() {
    const theaterId = get(this, 'theaterId');
    const sceneWindowId = get(this, 'sceneWindowId');

    this.on(`et:${theaterId}:${sceneWindowId}:closingWindow`, this, this.close);
  }),

  handlePriorSceneRecord: on('didReceiveAttrs', function() {
    const sceneRecord = get(this, 'priorSceneRecord') || {};
    const directable = get(this, 'directable');

    if (isNone(directable)) { return; }

    set(this, 'sceneRecord', sceneRecord);
    set(this, 'directable.direction.result', sceneRecord);
  }),

  transitionInWindow: on('didInsertElement', function() {
    this.executeTransitionIn().then(() => {
      this.resolve();
    });
  }),

  close() {
    this.executeTransitionOut().then(() => {
      this.removeDirectable();
    });
  }
});
