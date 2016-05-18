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

configurablePriority.forEach((priority) => {
  test(`applies the classNames found in ${priority}`, function(assert) {
    assert.expect(1);

    const attrContainer = { config: { }, directable: { } };

    priority.split('.').reduce((parentObject, segment) => {
      const childObject = { };

      parentObject[segment] = childObject;

      return childObject;
    }, attrContainer);

    Ember.set(attrContainer, `${priority}.classNames`, ['foo']);

    this.setProperties(Ember.getProperties(attrContainer, 'config', 'directable'));

    this.render(hbs`{{ember-theater-director-scene-window config=config directable=directable}}`);

    assert.ok($hook('ember_theater_director_scene_window_main').hasClass('foo'), 'has class');
  });
});

test('it renders a child director', function(assert) {
  assert.expect(1);

  this.render(hbs`{{ember-theater-director-scene-window}}`);

  assert.ok($hook('ember_theater_director').length > 0, 'director is rendered');
});
