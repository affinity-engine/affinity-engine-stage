import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { initialize as initializeHook } from 'ember-hook';
import { initialize as initializeMultitons } from 'ember-multiton-service';

const {
  getOwner
} = Ember;

moduleForComponent('ember-theater-director', 'Integration | Component | ember theater director', {
  integration: true,

  beforeEach() {
    initializeHook();
    initializeMultitons(getOwner(this));
  }
});

test('when no `windowId` is provided, it loads the latest scene and sets the initialScene', function(assert) {
  assert.expect(2);

  const initialScene = 'foo';

  const sceneManager = {
    setinitialScene(arg) {
      assert.equal(arg, initialScene, '`setInitialScene` is passed the `initialScene`');
    },
    loadLatestScene() {
      assert.ok(true, '`loadLatestScene` is called');
    },
    toScene() {
      assert.ok(false, '`toScene` is not called');
    }
  };

  this.setProperties({ initialScene, sceneManager });

  this.render(hbs`{{ember-theater-director sceneManager=sceneManager initialScene=initialScene}}`);
});

test('when a `windowId` is provided, it calls `toScene`', function(assert) {
  assert.expect(2);

  const initialScene = 'foo';
  const sceneRecord = {};
  const windowArg = {};

  const sceneManager = {
    setInitialScene() {
      assert.ok(false, '`setInitialScene` is not called');
    },
    loadLatestScene() {
      assert.ok(false, '`loadLatestScene` is not called');
    },
    toScene(initialSceneArg, options) {
      assert.equal(initialSceneArg, initialScene, '`initialScene` is passed in');
      assert.deepEqual(options, { autosave: false, sceneRecord, window: windowArg }, '`options` are correct');
    }
  };

  this.setProperties({ initialScene, sceneRecord, window: windowArg, sceneManager });

  this.render(hbs`{{ember-theater-director sceneManager=sceneManager initialScene=initialScene windowId='bar' sceneRecord=sceneRecord window=window}}`);
});
