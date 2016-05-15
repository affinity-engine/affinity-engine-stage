import Ember from 'ember';
import { test } from 'qunit';
import moduleForAcceptance from '../helpers/module-for-acceptance';
import { $hook, hook } from 'ember-hook';

moduleForAcceptance('Acceptance | direction');

test('Ember Theater | Director | Direction', function(assert) {
  assert.expect(12);

  visit('/').then(() => {
    return delay(350);
  }).then(() => {
    assert.ok(Ember.$(`
      .et-director
      .et-layer-
      .et-layer-theater
      .et-layer-theater-meta
      .et-layer-theater-meta-test
      ${hook('test_direction')}
    `).length > 0, 'test direction is rendered in correct layer');
    assert.equal($hook('test_direction_header').text().trim(), 'First Test Header', 'first header is initialized correctly');
    assert.equal($hook('test_direction_text').text().trim(), '', 'first text is initially blank');

    return step(100);
  }).then(() => {
    assert.equal($hook('test_direction_header').text().trim(), 'First Test Header', 'first header is unchanged');
    assert.equal($hook('test_direction_text').text().trim(), 'foo', 'first test text is changed');

    return step(100);
  }).then(() => {
    assert.equal(Ember.$(`${hook('test_direction_header')}:nth(1)`).text().trim(), 'Second Test Header', 'second header is correct');
    assert.equal(Ember.$(`${hook('test_direction_text')}:nth(1)`).text().trim(), 'bar', 'second test text set initially');
    assert.equal(Ember.$(`${hook('test_direction_header')}:nth(0)`).text().trim(), 'First Test Header', 'first header is unchanged after second inserted');
    assert.equal(Ember.$(`${hook('test_direction_text')}:nth(0)`).text().trim(), 'foo', 'first test text unchanged after second inserted');

    return step(100);
  }).then(() => {
    assert.equal(Ember.$(`${hook('test_direction_header')}:nth(2)`).text().trim(), 'Third Test Header', 'third header is correct');
    assert.equal(Ember.$(`${hook('test_direction_text')}:nth(2)`).text().trim(), 'baz', 'third test text set initially');
    assert.equal(Ember.$(`${hook('test_direction_footer')}:nth(2)`).text().trim(), 'alpha omega', 'direction passed successfully');
  });
});
