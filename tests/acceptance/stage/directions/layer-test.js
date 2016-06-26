import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../../../tests/helpers/module-for-acceptance';
import { hook } from 'ember-hook';

moduleForAcceptance('Acceptance | affinity-engine/stage/directions/layer', {
  beforeEach() {
    Ember.$.Velocity.mock = true;
  },

  afterEach() {
    Ember.$.Velocity.mock = false;
  }
});

test('Ember Theater | stage | Directions | Layer', function(assert) {
  assert.expect(8);

  visit('/affinity-engine/test-scenarios/stage/directions/layer').then(() => {
    assert.ok(Ember.$(`
      .et-stage
      .et-layer-
      .et-layer-theater
      .et-layer-theater-meta
      .et-layer-theater-meta-basic
      ${hook('basic_direction')}
    `).length > 0, 'basic direction is rendered in correct layer');

      return step(25);
  }).then(() => {
    assert.equal(Ember.$('.et-layer-theater').css('opacity'), 1, 'parent layer did not transition');
    assert.equal(Ember.$('.et-layer-theater-meta').css('opacity'), 0.5, 'layer transitioned');
    assert.equal(Ember.$('.et-layer-theater-meta-basic').css('opacity'), 1, 'child layer did not transition');

    return step(25);
  }).then(() => {
    assert.equal(Ember.$('.et-layer-theater-meta').css('opacity'), 0.5, 'layer keeps old transition');
    assert.equal(Ember.$('.et-layer-theater-meta').css('padding'), '123px', 'layer adds new transition');

    return step(75);
  }).then(() => {
    assert.equal(Ember.$('.et-layer-theater-meta').css('padding'), '456px', 'layer can rechange attribute');
    assert.equal(Ember.$('.et-layer-theater-meta').css('margin'), '555px', 'layer can undergo full transition queues');
  });
});
