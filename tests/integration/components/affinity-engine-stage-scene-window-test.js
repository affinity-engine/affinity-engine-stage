import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { $hook, initialize as initializeHook } from 'ember-hook';
import { initialize as initializeStage } from 'affinity-engine-stage';

const {
  getOwner
} = Ember;

moduleForComponent('affinity-engine-stage-scene-window', 'Integration | Component | affinity engine stage scene window', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeHook();
    initializeStage(appInstance);
  }
});

test('it applies `direction.windowClassNames`', function(assert) {
  assert.expect(1);

  this.set('direction', { configuration: { windowClassNames: ['foo'] } });

  this.render(hbs`{{affinity-engine-stage-scene-window direction=direction engineId="foo" window="bar"}}`);

  assert.ok($hook('affinity_engine_stage_scene_window_main').hasClass('foo'), 'has class');
});

test('it applies a z-index based on `direction.priority``', function(assert) {
  assert.expect(1);

  this.set('direction', { configuration: { priority: 5 } });

  this.render(hbs`{{affinity-engine-stage-scene-window direction=direction engineId="foo" window="bar"}}`);

  assert.equal($hook('affinity_engine_stage_scene_window_main').attr('style'), 'z-index: 5000;', 'style is correct');
});

test('it applies the screen based on `direction.screen`', function(assert) {
  assert.expect(1);

  this.set('direction', { configuration: { screen: true } });

  this.render(hbs`{{affinity-engine-stage-scene-window direction=direction engineId="foo" window="bar"}}`);

  assert.ok($hook('affinity_engine_stage_scene_window_screen').length > 0, 'screen is visible');
});

test('it gives the screen a priority based on `direction.priority`', function(assert) {
  assert.expect(1);

  this.set('direction', { configuration: { screen: true, priority: 5 } });

  this.render(hbs`{{affinity-engine-stage-scene-window direction=direction engineId="foo" window="bar"}}`);

  assert.ok($hook('affinity_engine_stage_scene_window_screen').attr('style'), 'z-index: 5000;', 'style is correct');
});

test('it renders a child stage', function(assert) {
  assert.expect(1);

  this.render(hbs`{{affinity-engine-stage-scene-window engineId="foo" window="bar"}}`);

  assert.ok($hook('affinity_engine_stage').length > 0, 'stage is rendered');
});

test('hides the screen by default', function(assert) {
  assert.expect(1);

  this.render(hbs`{{affinity-engine-stage-scene-window engineId="foo" window="bar"}}`);

  assert.ok($hook('affinity_engine_stage_scene_window_screen').length === 0, 'screen is hidden');
});

test('sets data scene-window-id', function(assert) {
  assert.expect(1);

  const window = 'foo';

  this.set('window', window);

  this.render(hbs`{{affinity-engine-stage-scene-window engineId="foo" window=window}}`);

  assert.ok($hook('affinity_engine_stage_scene_window').data('scene-window-id'), 'foo', 'data set correctly');
});
