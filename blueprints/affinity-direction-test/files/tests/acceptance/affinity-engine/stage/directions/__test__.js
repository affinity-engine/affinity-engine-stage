import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | affinity-engine/stage/directions/<%= dasherizedModuleName %>', {
  beforeEach() {
    Ember.$.Velocity.mock = true;
  },

  afterEach() {
    Ember.$.Velocity.mock = false;
  }
});

test('Affinity Engine | stage | Directions | <%= classifiedModuleName %>', function(assert) {
  visit('/test-scenarios/affinity-engine/stage/directions/<%= dasherizedModuleName %>');
});
