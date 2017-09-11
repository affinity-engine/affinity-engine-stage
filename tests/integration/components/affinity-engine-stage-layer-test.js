import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { $hook, hook, initialize as initializeHook } from 'ember-hook';
import multiton from 'ember-multiton-service';
import { initialize as initializeStage } from 'affinity-engine-stage';

const {
  getOwner
} = Ember;

const engineId = 'engineId'

const Config = Ember.Object.extend({ eBus: multiton('message-bus', 'engineId'), engineId,
  attrs: {
    component: {
      stage: {
        layer: {}
      }
    }
  }
});

moduleForComponent('affinity-engine-stage-layer', 'Integration | Component | affinity engine stage layer', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeHook();
    initializeStage(appInstance);
    appInstance.register('ember-message-bus:affinity-engine/config', Config);
  }
});

test('class name is bound to layer name', function(assert) {
  assert.expect(2);

  this.setProperties({
    name: '',
    engineId
  });

  this.render(hbs`{{affinity-engine-stage-layer
    name=name
    engineId=engineId
  }}`);

  assert.ok($hook('affinity_engine_stage_layer').hasClass('ae-stage-layer-'), 'has correct class when name is blank');

  this.set('name', 'foo');

  assert.ok($hook('affinity_engine_stage_layer').hasClass('ae-stage-layer-foo'), 'has correct class when name is foo');
});

test('renders a filtered list of directions', function(assert) {
  assert.expect(2);

  const name = 'foo';
  const componentPath = 'simple-directable';

  const directions = Ember.A([{
    layer: 'foo.bar',
    componentPath
  }, {
    layer: name,
    componentPath
  }, {
    layer: 'foo.bar',
    componentPath
  }, {
    layer: name,
    componentPath
  }]);

  this.setProperties({ name, directions, engineId });

  this.render(hbs`{{affinity-engine-stage-layer
    directions=directions
    name=name
    hook="parent_layer"
    engineId=engineId
  }}`);

  const parentLayer = $hook('parent_layer').first();
  const parentLayerDirectables = parentLayer.children(hook('simple_directable'));

  assert.equal(parentLayerDirectables.length, 2, 'list is filtered');
  assert.ok(parentLayerDirectables.toArray().every((elem) => Ember.$(elem).text().trim() === name), 'filtered list is correct');
});

test('renders a filtered list of directions', function(assert) {
  assert.expect(2);

  const name = 'foo';
  const componentPath = 'simple-directable';

  const directions = Ember.A([{
    layer: 'foo.bar',
    componentPath
  }, {
    layer: name,
    componentPath
  }, {
    layer: 'foo.bar',
    componentPath
  }, {
    layer: name,
    componentPath
  }]);

  this.setProperties({ name, directions, engineId });

  this.render(hbs`{{affinity-engine-stage-layer
    directions=directions
    name=name
    hook="parent_layer"
    engineId=engineId
  }}`);

  const parentLayer = $hook('parent_layer').first();
  const parentLayerDirectables = parentLayer.children(hook('simple_directable'));

  assert.equal(parentLayerDirectables.length, 2, 'list is filtered');
  assert.ok(parentLayerDirectables.toArray().every((elem) => Ember.$(elem).text().trim() === name), 'filtered list is correct');
});

test('renders child layers based on the layer names of its directions', function(assert) {
  assert.expect(13);

  const name = 'foo';
  const componentPath = 'simple-directable';

  const directions = Ember.A([{
    layer: 'foo.bar',
    componentPath
  }, {
    layer: 'foo.bar.baz',
    componentPath
  }, {
    layer: 'foo.baz.foo',
    componentPath
  }, {
    layer: 'foo',
    componentPath
  }]);

  this.setProperties({ name, directions, engineId });

  this.render(hbs`{{affinity-engine-stage-layer
    directions=directions
    name=name
    hook="parent_layer"
    engineId=engineId
  }}`);

  const fooLayer = $hook('parent_layer').first();
  const fooLayerDirectables = fooLayer.children(hook('simple_directable'));
  assert.equal(fooLayerDirectables.length, 1, 'foo layer directions rendered');
  assert.equal(fooLayerDirectables.first().text().trim(), 'foo', 'correct foo layer filter');

  const fooBarLayer = fooLayer.children('.ae-stage-layer-foo-bar');
  const fooBarLayerDirectables = fooBarLayer.children(hook('simple_directable'));
  assert.equal(fooBarLayer.length, 1, 'foo-bar layer rendered');
  assert.equal(fooBarLayerDirectables.length, 1, 'foo-bar layer directions rendered');
  assert.equal(fooBarLayerDirectables.first().text().trim(), 'foo.bar', 'correct foo-bar layer filter');

  const fooBarBazLayer = fooBarLayer.children('.ae-stage-layer-foo-bar-baz');
  const fooBarBazLayerDirectables = fooBarBazLayer.children(hook('simple_directable'));
  assert.equal(fooBarBazLayer.length, 1, 'foo-bar-baz layer rendered');
  assert.equal(fooBarBazLayerDirectables.length, 1, 'foo-bar-baz layer directions rendered');
  assert.equal(fooBarBazLayerDirectables.first().text().trim(), 'foo.bar.baz', 'correct foo-bar-baz layer filter');

  const fooBazLayer = fooLayer.children('.ae-stage-layer-foo-baz');
  const fooBazLayerDirectables = fooBazLayer.children(hook('simple_directable'));
  assert.equal(fooBazLayer.length, 1, 'foo-baz layer rendered');
  assert.equal(fooBazLayerDirectables.length, 0, 'foo-bar layer directions rendered');

  const fooBazFooLayer = fooBazLayer.children('.ae-stage-layer-foo-baz-foo');
  const fooBazFooLayerDirectables = fooBazFooLayer.children(hook('simple_directable'));
  assert.equal(fooBazFooLayer.length, 1, 'foo-baz-foo layer rendered');
  assert.equal(fooBazFooLayerDirectables.length, 1, 'foo-baz-foo layer directions rendered');
  assert.equal(fooBazFooLayerDirectables.first().text().trim(), 'foo.baz.foo', 'correct foo-baz-foo layer filter');
});
