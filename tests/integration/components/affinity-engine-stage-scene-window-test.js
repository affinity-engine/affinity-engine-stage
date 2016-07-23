import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { $hook, initialize as initializeHook } from 'ember-hook';
import { initializeQUnitAssertions } from 'ember-message-bus';
import { deepStub } from 'affinity-engine';
import { initialize as initializeStage } from 'affinity-engine-stage';

const {
  getOwner,
  getProperties,
  set
} = Ember;

moduleForComponent('affinity-engine-stage-scene-window', 'Integration | Component | ember engine stage scene window', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeHook();
    initializeQUnitAssertions(appInstance);
    initializeStage(appInstance);
  }
});

const configurationTiers = [
  'directable.attrs',
  'config.attrs.stage.scene',
  'config.attrs.stage',
  'config.attrs.globals'
];

configurationTiers.forEach((priority) => {
  test(`applies the classNames found in ${priority}`, function(assert) {
    assert.expect(1);

    const stub = deepStub(priority, { classNames: ['foo'] });

    this.setProperties(getProperties(stub, 'config', 'directable'));

    this.render(hbs`{{affinity-engine-stage-scene-window config=config directable=directable engineId="foo" sceneWindowId="bar"}}`);

    assert.ok($hook('affinity_engine_stage_scene_window_main').hasClass('foo'), 'has class');
  });

  test(`applies a z-index based on ${priority}`, function(assert) {
    assert.expect(1);

    const stub = deepStub(priority, { priority: 5 });

    this.setProperties(getProperties(stub, 'config', 'directable'));

    this.render(hbs`{{affinity-engine-stage-scene-window config=config directable=directable engineId="foo" sceneWindowId="bar"}}`);

    assert.equal($hook('affinity_engine_stage_scene_window_main').attr('style'), 'z-index: 5000;', 'style is correct');
  });

  test(`applies the screen based on ${priority}`, function(assert) {
    assert.expect(1);

    const stub = deepStub(priority, { screen: true });

    this.setProperties(getProperties(stub, 'config', 'directable'));

    this.render(hbs`{{affinity-engine-stage-scene-window config=config directable=directable engineId="foo" sceneWindowId="bar"}}`);

    assert.ok($hook('affinity_engine_stage_scene_window_screen').length > 0, 'screen is visible');
  });

  test(`gives the screen a priority based on ${priority}`, function(assert) {
    assert.expect(1);

    const stub = deepStub(priority, { screen: true });

    set(stub, 'priority', 5);

    this.setProperties(getProperties(stub, 'config', 'directable'));

    this.render(hbs`{{affinity-engine-stage-scene-window config=config directable=directable engineId="foo" sceneWindowId="bar"}}`);

    assert.ok($hook('affinity_engine_stage_scene_window_screen').attr('style'), 'z-index: 5000;', 'style is correct');
  });
});

test('it renders a child stage', function(assert) {
  assert.expect(1);

  this.render(hbs`{{affinity-engine-stage-scene-window engineId="foo" sceneWindowId="bar"}}`);

  assert.ok($hook('affinity_engine_stage').length > 0, 'stage is rendered');
});

test('hides the screen by default', function(assert) {
  assert.expect(1);

  this.render(hbs`{{affinity-engine-stage-scene-window engineId="foo" sceneWindowId="bar"}}`);

  assert.ok($hook('affinity_engine_stage_scene_window_screen').length === 0, 'screen is hidden');
});

test('sets data scene-window-id', function(assert) {
  assert.expect(1);

  const sceneWindowId = 'foo';

  this.set('sceneWindowId', sceneWindowId);

  this.render(hbs`{{affinity-engine-stage-scene-window  engineId="foo" sceneWindowId=sceneWindowId}}`);

  assert.ok($hook('affinity_engine_stage_scene_window').data('scene-window-id'), 'foo', 'data set correctly');
});
