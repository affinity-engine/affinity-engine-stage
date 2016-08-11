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

test('it renders an `affinity-engine-stage-layer`', function(assert) {
  assert.expect(2);

  this.render(hbs`{{affinity-engine-stage  engineId="foo"}}`);

  const $layer = $hook('affinity_engine_stage_layer');

  assert.equal($layer.length, 1, 'renders a single layer');
  assert.ok($layer.hasClass('ae-stage-layer-'), 'layer has correct name');
});
