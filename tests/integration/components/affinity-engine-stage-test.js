import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { $hook, initialize as initializeHook } from 'ember-hook';
import { initializeQUnitAssertions } from 'ember-message-bus';
import { initialize as initializeStage } from 'affinity-engine-stage';

const {
  getOwner
} = Ember;

moduleForComponent('affinity-engine-stage', 'Integration | Component | ember engine stage', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeHook();
    initializeQUnitAssertions(appInstance);
    initializeStage(appInstance);
  }
});

test('when no `windowId` is provided, it publishes `shouldInitializeGame`', function(assert) {
  assert.expect(1);

  const initialScene = 'foo';
  const engineId = 'bar';

  assert.willPublish('ae:bar:shouldInitializeGame', [initialScene], '`shouldInitializeGame` is passed the `initialScene`');

  this.setProperties({ initialScene, engineId });

  this.render(hbs`{{affinity-engine-stage
    initialScene=initialScene
    engineId=engineId
  }}`);
});

test('when a `windowId` is provided, it publishes `shouldStartScene`', function(assert) {
  assert.expect(1);

  const initialScene = 'foo';
  const sceneRecord = {};
  const engineId = 'bar';
  const windowArg = {};
  const windowId = 'baz';

  assert.willNotPublish(`ae:${engineId}:shouldInitializeGame`, '`shouldInitializeGame` is not triggered');
  assert.willPublish(`ae:${engineId}:${windowId}:shouldStartScene`, [initialScene, { autosave: false, sceneRecord, window: windowArg }], '`shouldStartScene` is triggered');

  this.setProperties({
    initialScene,
    sceneRecord,
    engineId,
    windowId,
    window: windowArg
  });

  this.render(hbs`{{affinity-engine-stage
    initialScene=initialScene
    sceneRecord=sceneRecord
    engineId=engineId
    window=window
    windowId=windowId
  }}`);
});

test('it renders an `affinity-engine-stage-layer`', function(assert) {
  assert.expect(2);

  this.render(hbs`{{affinity-engine-stage  engineId="foo"}}`);

  const $layer = $hook('affinity_engine_stage_layer');

  assert.equal($layer.length, 1, 'renders a single layer');
  assert.ok($layer.hasClass('ae-stage-layer-'), 'layer has correct name');
});
