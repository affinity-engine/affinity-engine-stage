import Ember from 'ember';
import layout from '../templates/components/ember-theater-director';
import multiton from 'ember-multiton-service';

const {
  Component,
  computed,
  get,
  getProperties,
  on
} = Ember;

const { alias } = computed;

export default Component.extend({
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
      sceneManager,
      windowId,
      window
    } = getProperties(this, 'initialScene', 'sceneManager', 'windowId', 'window');

    if (windowId === 'main') {
      sceneManager.setinitialScene(initialScene);
      sceneManager.loadLatestScene();
    } else {
      const sceneRecord = get(this, 'sceneRecord');

      sceneManager.toScene(initialScene, { autosave: false, sceneRecord, window });
    }
  })
});
