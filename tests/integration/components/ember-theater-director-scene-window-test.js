import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { $hook, initialize as initializeHook } from 'ember-hook';
import { initialize as initializeMultitons } from 'ember-multiton-service';
import { initializeQUnitAssertions } from 'ember-message-bus';

const {
  getOwner
} = Ember;

moduleForComponent('ember-theater-director-scene-window', 'Integration | Component | ember theater director scene window', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeHook();
    initializeMultitons(appInstance);
    initializeQUnitAssertions(appInstance);
  }
});

const configurablePriority = [
  'directable.attrs',
  'config.attrs.director.scene',
  'config.attrs.director',
  'config.attrs.globals'
];

const attrContainerGenerator = (priority) => {
  const attrContainer = { config: { }, directable: { } };

  priority.split('.').reduce((parentObject, segment) => {
    const childObject = { };

    parentObject[segment] = childObject;

    return childObject;
  }, attrContainer);

  return attrContainer;
}

configurablePriority.forEach((priority) => {
  test(`applies the classNames found in ${priority}`, function(assert) {
    assert.expect(1);

    const attrContainer = attrContainerGenerator(priority);

    Ember.set(attrContainer, `${priority}.classNames`, ['foo']);

    this.setProperties(Ember.getProperties(attrContainer, 'config', 'directable'));

    this.render(hbs`{{ember-theater-director-scene-window config=config directable=directable}}`);

    assert.ok($hook('ember_theater_director_scene_window_main').hasClass('foo'), 'has class');
  });

  test(`applies a z-index based on ${priority}`, function(assert) {
    assert.expect(1);

    const attrContainer = attrContainerGenerator(priority);

    Ember.set(attrContainer, `${priority}.priority`, 5);

    this.setProperties(Ember.getProperties(attrContainer, 'config', 'directable'));

    this.render(hbs`{{ember-theater-director-scene-window config=config directable=directable}}`);

    assert.equal($hook('ember_theater_director_scene_window_main').attr('style'), 'z-index: 5000;', 'style is correct');
  });

  test(`applies the screen based on ${priority}`, function(assert) {
    assert.expect(1);

    const attrContainer = attrContainerGenerator(priority);

    Ember.set(attrContainer, `${priority}.screen`, true);

    this.setProperties(Ember.getProperties(attrContainer, 'config', 'directable'));

    this.render(hbs`{{ember-theater-director-scene-window config=config directable=directable}}`);

    assert.ok($hook('ember_theater_director_scene_window_screen').length > 0, 'screen is visible');
  });

  test(`gives the screen a priority based on ${priority}`, function(assert) {
    assert.expect(1);

    const attrContainer = attrContainerGenerator(priority);

    Ember.set(attrContainer, `${priority}.screen`, true);
    Ember.set(attrContainer, `${priority}.priority`, 5);

    this.setProperties(Ember.getProperties(attrContainer, 'config', 'directable'));

    this.render(hbs`{{ember-theater-director-scene-window config=config directable=directable}}`);

    assert.ok($hook('ember_theater_director_scene_window_screen').attr('style'), 'z-index: 5000;', 'style is correct');
  });
});

test('it renders a child director', function(assert) {
  assert.expect(1);

  this.render(hbs`{{ember-theater-director-scene-window}}`);

  assert.ok($hook('ember_theater_director').length > 0, 'director is rendered');
});

test('hides the screen by default', function(assert) {
  assert.expect(1);

  this.render(hbs`{{ember-theater-director-scene-window}}`);

  assert.ok($hook('ember_theater_director_scene_window_screen').length === 0, 'screen is hidden');
});

test('sets data scene-window-id', function(assert) {
  assert.expect(1);

  const sceneWindowId = 'foo';

  this.set('sceneWindowId', sceneWindowId);

  this.render(hbs`{{ember-theater-director-scene-window sceneWindowId=sceneWindowId}}`);

  assert.ok($hook('ember_theater_director_scene_window').data('scene-window-id'), 'foo', 'data set correctly');
});
