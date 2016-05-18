import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../tests/helpers/module-for-acceptance';
import { $hook, hook } from 'ember-hook';

moduleForAcceptance('Acceptance | scenes change', {
  beforeEach() {
    Ember.testing = false;
    Ember.$.Velocity.mock = true;
    localStorage.clear();
  },

  afterEach() {
    Ember.$.Velocity.mock = false;
  }
});

test('scene change', function(assert) {
  assert.expect();

  visit('/test-scenarios/scene-change').then(() => {
    return delay(350);
  }).then(() => {
    assert.equal($hook('basic_direction_header').text().trim(), 'Scene One', 'starts on scene 1');

    return step(100);
  }).then(() => {
    assert.equal($hook('basic_direction_header').text().trim(), 'Scene Two', 'transitions to scene 2');

    return step(200);
  }).then(() => {
    assert.equal($hook('basic_direction_header').length, 3, 'multiple scenes are present at once');
    assert.equal($hook('basic_direction_header').eq(0).text().trim(), 'Scene Two', 'main scene is unchanged');
    assert.equal($hook('basic_direction_header').eq(1).text().trim(), 'Scene Three', 'first child scene is present');
    assert.equal($hook('basic_direction_header').eq(2).text().trim(), 'Scene Four', 'second child scene is present');

    assert.equal(
      Ember.$(`${hook('ember_theater_director_scene_window')}[data-scene-window-id="simple-window"]`).
      find(hook('ember_theater_director_scene_window_screen')).length, 0, 'first child has no screen');

    assert.ok(
      Ember.$(`${hook('ember_theater_director_scene_window')}[data-scene-window-id="window-with-screen"]`).
      find(hook('ember_theater_director_scene_window_screen')).hasClass('foo'), 'second child has screen with provided class name');

    return step(100);
  }).then(() => {
    assert.equal($hook('basic_direction_header').length, 3, 'number of scenes is unchanged');
    assert.equal($hook('basic_direction_header').eq(0).text().trim(), 'Scene Two', 'main scene is still unchanged');
    assert.equal($hook('basic_direction_header').eq(1).text().trim(), 'Scene Five', 'first child scene changed');
    assert.equal($hook('basic_direction_header').eq(2).text().trim(), 'Scene Four', 'second child scene is unchanged');

    return step(100);
  }).then(() => {
    assert.equal($hook('basic_direction_header').length, 2, 'a scene has closed');
    assert.equal($hook('basic_direction_header').eq(0).text().trim(), 'Scene Two', 'main scene is still present');
    assert.equal($hook('basic_direction_header').eq(1).text().trim(), 'Scene Four', 'second child scene is still present');

    return step(100);
  })
});
