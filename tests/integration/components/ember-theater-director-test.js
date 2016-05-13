import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { $hook, initialize as initializeHook } from 'ember-hook';
import { initialize as initializeMultitons } from 'ember-multiton-service';
import { BusSubscriberMixin } from 'ember-message-bus';

const {
  getOwner,
  on
} = Ember;

const Subscriber = Ember.Object.extend(BusSubscriberMixin);

moduleForComponent('ember-theater-director', 'Integration | Component | ember theater director', {
  integration: true,

  beforeEach() {
    initializeHook();
    initializeMultitons(getOwner(this));
  }
});

test('when no `windowId` is provided, it loads the latest scene and sets the initialScene', function(assert) {
  assert.expect(1);

  const initialScene = 'foo';
  const theaterId = 'bar';

  const appInstance = getOwner(this);
  appInstance.register('emb:subscriber', Subscriber, { instantiate: false });

  appInstance.lookup('emb:subscriber').extend({
    gameIsInitializing: on(`et:bar:gameIsInitializing`, function(arg) {
      assert.equal(arg, initialScene, '`gameIsInitializing` is passed the `initialScene`');
    }),
    sceneIsChanging: on(`et:main:${theaterId}:sceneIsChanging`, function() {
      assert.ok(false, '`sceneIsChanging` is not called');
    })
  }).create();

  this.setProperties({ initialScene, theaterId });

  this.render(hbs`{{ember-theater-director
    initialScene=initialScene
    theaterId=theaterId
  }}`);
});

test('when a `windowId` is provided, it calls `toScene`', function(assert) {
  assert.expect(2);

  const initialScene = 'foo';
  const sceneRecord = {};
  const theaterId = 'bar';
  const windowArg = {};
  const windowId = 'baz';

  const appInstance = getOwner(this);
  appInstance.register('emb:subscriber', Subscriber, { instantiate: false });

  appInstance.lookup('emb:subscriber').extend({
    gameIsInitializing: on(`et:${theaterId}:gameIsInitializing`, function() {
      assert.ok(false, '`gameIsInitializing` is not triggered');
    }),
    sceneIsChanging: on(`et:${theaterId}:${windowId}:sceneIsChanging`, function(initialSceneArg, options) {
      assert.equal(initialSceneArg, initialScene, '`initialScene` is passed in');
      assert.deepEqual(options, { autosave: false, sceneRecord, window: windowArg }, '`options` are correct');
    })
  }).create();

  this.setProperties({
    initialScene,
    sceneRecord,
    theaterId,
    windowId,
    window: windowArg
  });

  this.render(hbs`{{ember-theater-director
    initialScene=initialScene
    sceneRecord=sceneRecord
    theaterId=theaterId
    window=window
    windowId=windowId
  }}`);
});

test('it renders an `ember-theater-director-layer`', function(assert) {
  assert.expect(2);

  this.render(hbs`{{ember-theater-director}}`);

  const $layer = $hook('ember_theater_director_layer');

  assert.equal($layer.length, 1, 'renders a single layer');
  assert.ok($layer.hasClass('et-layer-'), 'layer has correct name');
});
