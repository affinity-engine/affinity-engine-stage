import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { $hook, initialize as initializeHook } from 'ember-hook';
import { initialize as initializeMultitons } from 'ember-multiton-service';
import { initializeQUnitAssertions } from 'ember-message-bus';
import { initialize as initializeDirector } from 'ember-theater-director';

const {
  getOwner
} = Ember;

moduleForComponent('ember-theater-director', 'Integration | Component | ember theater director', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeHook();
    initializeMultitons(appInstance);
    initializeQUnitAssertions(appInstance);
    initializeDirector(appInstance);
  }
});

test('when no `windowId` is provided, it publishes `gameIsInitializing`', function(assert) {
  assert.expect(1);

  const initialScene = 'foo';
  const theaterId = 'bar';

  assert.willPublish('et:bar:gameIsInitializing', [initialScene], '`gameIsInitializing` is passed the `initialScene`');

  this.setProperties({ initialScene, theaterId });

  this.render(hbs`{{ember-theater-director
    initialScene=initialScene
    theaterId=theaterId
  }}`);
});

test('when a `windowId` is provided, it publishes `sceneIsChanging`', function(assert) {
  assert.expect(1);

  const initialScene = 'foo';
  const sceneRecord = {};
  const theaterId = 'bar';
  const windowArg = {};
  const windowId = 'baz';

  assert.willNotPublish(`et:${theaterId}:gameIsInitializing`, '`gameIsInitializing` is not triggered');
  assert.willPublish(`et:${theaterId}:${windowId}:sceneIsChanging`, [initialScene, { autosave: false, sceneRecord, window: windowArg }], '`sceneIsChanging` is triggered');

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
