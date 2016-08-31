import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../../../../tests/helpers/module-for-acceptance';
import { $hook, hook } from 'ember-hook';

moduleForAcceptance('Acceptance | affinity-engine/stage/directions/basic-direction');

test('Affinity Engine | stage | Directions | BasicDirection', function(assert) {
  assert.expect(16);

  visit('/affinity-engine/test-scenarios/stage/directions/basic-direction').then(() => {
    assert.ok(Ember.$(`
      .ae-stage
      .ae-stage-layer-
      .ae-stage-layer-engine
      .ae-stage-layer-engine-meta
      .ae-stage-layer-engine-meta-basic
      ${hook('basic_direction')}
    `).length > 0, 'basic direction is rendered in correct layer');
    assert.equal($hook('basic_direction_header').text().trim(), 'Syncronous Header', 'syncronous header is initialized correctly');
    assert.equal($hook('basic_direction_text').text().trim(), '', 'syncronous text is initially blank');

    return step();
  }).then(() => {
    assert.equal($hook('basic_direction_header').text().trim(), 'Syncronous Header', 'syncronous header is unchanged');
    assert.equal($hook('basic_direction_text').text().trim(), 'foo', 'syncronous basic text is changed');

    return step();
  }).then(() => {
    assert.equal(Ember.$(`${hook('basic_direction_header')}:nth(1)`).text().trim(), 'Asyncronous Header', 'asyncronous header is initialized correctly');
    assert.equal(Ember.$(`${hook('basic_direction_text')}:nth(1)`).text().trim(), '', 'asyncronous text is initially blank');
    assert.equal(Ember.$(`${hook('basic_direction_header')}:nth(0)`).text().trim(), 'Syncronous Header', 'other header is unchanged after this one inserted');
    assert.equal(Ember.$(`${hook('basic_direction_text')}:nth(0)`).text().trim(), 'foo', 'other basic text unchanged after second inserted');

    return step();
  }).then(() => {
    assert.equal(Ember.$(`${hook('basic_direction_header')}:nth(1)`).text().trim(), 'Asyncronous Header', 'asyncronous header is unchanged');
    assert.equal(Ember.$(`${hook('basic_direction_text')}:nth(1)`).text().trim(), 'foo', 'asyncronous basic text is changed');

    return step();
  }).then(() => {
    assert.equal(Ember.$(`${hook('basic_direction_header')}:nth(2)`).text().trim(), 'Uninstantiated Header', 'uninstantiated header is correct');
    assert.equal(Ember.$(`${hook('basic_direction_text')}:nth(2)`).text().trim(), 'bar', 'uninstantiated basic text set initially');

    return step(10);
  }).then(() => {
    assert.equal(Ember.$(`${hook('basic_direction_header')}:nth(3)`).text().trim(), 'Chained Header', 'chained header is correct');
    assert.equal(Ember.$(`${hook('basic_direction_text')}:nth(3)`).text().trim(), 'baz', 'chained basic text set initially');
    assert.equal(Ember.$(`${hook('basic_direction_footer')}:nth(3)`).text().trim(), 'alpha omega', 'direction passed successfully');
  });
});
