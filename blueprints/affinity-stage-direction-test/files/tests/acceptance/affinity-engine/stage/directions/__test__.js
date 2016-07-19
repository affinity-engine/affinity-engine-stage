import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../../../tests/helpers/module-for-acceptance';

moduleForAcceptance('Acceptance | affinity-engine/stage/directions/<%= dasherizedModuleName %>');

test('Affinity Engine | stage | Directions | <%= classifiedModuleName %>', function(assert) {
  visit('/test-scenarios/affinity-engine/stage/directions/<%= dasherizedModuleName %>');
});
