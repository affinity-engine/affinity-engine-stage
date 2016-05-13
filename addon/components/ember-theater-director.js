import Ember from 'ember';
import layout from '../templates/components/ember-theater-director';
import multiton from 'ember-multiton-service';
import { BusPublisherMixin } from 'ember-message-bus';

const {
  Component,
  computed,
  get,
  getProperties,
  on
} = Ember;

const { alias } = computed;

export default Component.extend(BusPublisherMixin, {
  layout,

  hook: 'ember_theater_director',

  classNames: ['et-director'],
  windowId: 'main',

  producer: multiton('ember-theater/producer', 'theaterId'),
  sceneManager: multiton('ember-theater/director/scene-manager', 'theaterId', 'windowId'),
  stageManager: multiton('ember-theater/director/stage-manager', 'theaterId', 'windowId'),

  directables: alias('stageManager.directables'),

  _loadLatestScene: on('didInsertElement', function() {
    const {
      initialScene,
      theaterId,
      windowId,
      window
    } = getProperties(this, 'initialScene', 'theaterId', 'windowId', 'window');

    if (windowId === 'main') {
      this.publish(`et:${theaterId}:gameIsInitializing`, initialScene);
    } else {
      const sceneRecord = get(this, 'sceneRecord');

      this.publish(`et:${theaterId}:${windowId}:sceneIsChanging`, initialScene, {
        autosave: false,
        sceneRecord,
        window
      });
    }
  })
});
