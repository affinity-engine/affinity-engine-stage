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

test('Affinity Engine | stage | Directions | Layer', function(assert) {
  assert.expect(12);

  visit('/affinity-engine/test-scenarios/stage/directions/layer').then(() => {
    assert.ok(Ember.$(`
      .ae-stage
      .ae-stage-layer-
      .ae-stage-layer-engine
      .ae-stage-layer-engine-meta
      .ae-stage-layer-engine-meta-basic
      ${hook('basic_direction')}
    `).length > 0, 'basic direction is rendered in correct layer');
  });

  step(25);

  andThen(() => {
    assert.equal(parseFloat(Ember.$(`.ae-stage-layer-engine ${hook('ember_animation_box')}`).css('opacity')).toFixed(1), 1, 'parent layer did not transition');
    assert.equal(parseFloat(Ember.$(`.ae-stage-layer-engine-meta ${hook('ember_animation_box')}`).css('opacity')).toFixed(1), 0.5, 'layer transitioned');
    assert.equal(parseFloat(Ember.$(`.ae-stage-layer-engine-meta-basic ${hook('ember_animation_box')}`).css('opacity')).toFixed(1), 1, 'child layer did not transition');
  });

  step(25);

  andThen(() => {
    assert.equal(parseFloat(Ember.$(`.ae-stage-layer-engine-meta ${hook('ember_animation_box')}`).css('opacity')).toFixed(1), 0.3, 'instantiated layer can transition');
  });

  step(25);

  andThen(() => {
    assert.equal(Ember.$(`.ae-stage-layer-engine-meta ${hook('ember_animation_box')}`).css('padding'), '456px', 'instantiated layer can change multiple attribute');
    assert.equal(parseFloat(Ember.$(`.ae-stage-layer-engine-meta ${hook('ember_animation_box')}`).css('opacity')).toFixed(1), 0.5, 'instantiated layer can transition a full queue');
  });

  step(75);

  andThen(() => {
    assert.equal(parseFloat(Ember.$(`.ae-stage-layer-engine-meta ${hook('ember_animation_box')}`).css('opacity')).toFixed(1), 0.5, 'layer keeps old transition');
    assert.equal(Ember.$(`.ae-stage-layer-engine-meta ${hook('ember_animation_box')}`).css('padding'), '123px', 'layer adds new transition');
  });

  step(75);

  andThen(() => {
    assert.equal(Ember.$(`.ae-stage-layer-engine-meta ${hook('ember_animation_box')}`).css('padding'), '450px', 'layer can rechange attribute');
    assert.equal(Ember.$(`.ae-stage-layer-engine-meta ${hook('ember_animation_box')}`).css('margin'), '555px', 'layer can undergo full transition queues');

  });

  step(75);

  andThen(() => {
    assert.equal(parseFloat(Ember.$(`.ae-stage-layer-engine-meta ${hook('ember_animation_box')}`).css('opacity')).toFixed(1), 0.3, 'instantiated layer can transition after non-instantiated');
  });
});
