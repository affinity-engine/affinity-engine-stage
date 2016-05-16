import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { $hook, hook, initialize as initializeHook } from 'ember-hook';
import { initialize as initializeMultitons } from 'ember-multiton-service';
import { initializeQUnitAssertions } from 'ember-message-bus';

const {
  get,
  getOwner,
  run
} = Ember;

moduleForComponent('ember-theater-director-layer', 'Integration | Component | ember theater director layer', {
  integration: true,

  beforeEach() {
    const appInstance = getOwner(this);

    initializeHook();
    initializeMultitons(appInstance);
    initializeQUnitAssertions(appInstance);
  }
});

test('`didInsertElement` publishes `layerAdded`', function(assert) {
  assert.expect(1);

  const theaterId = 'foo';
  const windowId = 'bar';
  const name = 'baz';

  assert.willPublish(
    `et:${theaterId}:${windowId}:layerAdded`,
    (layer) => get(layer, 'name') === name,
    '`layerAdded` is published with `layer`'
  );

  this.setProperties({ theaterId, windowId, name });

  this.render(hbs`{{ember-theater-director-layer
    theaterId=theaterId
    windowId=windowId
    name=name
  }}`);
});

test('`didInsertElement` prepares the layer for a filter animation ending', function(assert) {
  assert.expect(2);

  let canResolve = false;

  const effect = 'blur(5px)';

  const layerFilter = {
    effect,
    resolve: () => assert.ok(canResolve, 'resolve was run')
  };

  this.setProperties({ layerFilter });

  this.render(hbs`{{ember-theater-director-layer
    layerFilter=layerFilter
  }}`);

  run(() => {
    canResolve = true;
    $hook('ember_theater_director_layer').trigger('animationend');
    assert.ok($hook('ember_theater_director_layer').attr('style').indexOf(effect) > 0, 'filter was set');
  })
});

test('`willDestroyElement` publishes `layerRemoved`', function(assert) {
  assert.expect(1);

  const theaterId = 'foo';
  const windowId = 'bar';
  const name = 'baz';

  this.setProperties({ theaterId, windowId, name });

  this.render(hbs`{{ember-theater-director-layer
    theaterId=theaterId
    windowId=windowId
    name=name
  }}`);

  assert.willPublish(
    `et:${theaterId}:${windowId}:layerRemoved`,
    (layer) => get(layer, 'name') === name,
    '`layerRemoved` is published with `layer`'
  );

  this.clearRender();
});

test('class name is bound to layer name', function(assert) {
  assert.expect(2);

  this.set('name', '');

  this.render(hbs`{{ember-theater-director-layer
    name=name
  }}`);

  assert.ok($hook('ember_theater_director_layer').hasClass('et-layer-'), 'has correct class when name is blank');

  this.set('name', 'foo');

  assert.ok($hook('ember_theater_director_layer').hasClass('et-layer-foo'), 'has correct class when name is foo');
});

test('class name is bound to layer name', function(assert) {
  assert.expect(2);

  this.set('name', '');

  this.render(hbs`{{ember-theater-director-layer
    name=name
  }}`);

  assert.ok($hook('ember_theater_director_layer').hasClass('et-layer-'), 'has correct class when name is blank');

  this.set('name', 'foo');

  assert.ok($hook('ember_theater_director_layer').hasClass('et-layer-foo'), 'has correct class when name is foo');
});

test('renders a filtered list of directables', function(assert) {
  assert.expect(2);

  const name = 'foo';
  const componentPath = 'simple-directable';

  const directables = Ember.A([{
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

  this.setProperties({ name, directables });

  this.render(hbs`{{ember-theater-director-layer
    directables=directables
    name=name
    hook="parent_layer"
  }}`);

  const parentLayer = $hook('parent_layer');
  const parentLayerDirectables = parentLayer.children(hook('simple_directable'));

  assert.equal(parentLayerDirectables.length, 2, 'list is filtered');
  assert.ok(parentLayerDirectables.toArray().every((elem) => Ember.$(elem).text().trim() === name), 'filtered list is correct');
});

test('renders a filtered list of directables', function(assert) {
  assert.expect(2);

  const name = 'foo';
  const componentPath = 'simple-directable';

  const directables = Ember.A([{
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

  this.setProperties({ name, directables });

  this.render(hbs`{{ember-theater-director-layer
    directables=directables
    name=name
    hook="parent_layer"
  }}`);

  const parentLayer = $hook('parent_layer');
  const parentLayerDirectables = parentLayer.children(hook('simple_directable'));

  assert.equal(parentLayerDirectables.length, 2, 'list is filtered');
  assert.ok(parentLayerDirectables.toArray().every((elem) => Ember.$(elem).text().trim() === name), 'filtered list is correct');
});

test('renders child layers based on the layer names of its directables', function(assert) {
  assert.expect(13);

  const name = 'foo';
  const componentPath = 'simple-directable';

  const directables = Ember.A([{
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

  this.setProperties({ name, directables });

  this.render(hbs`{{ember-theater-director-layer
    directables=directables
    name=name
    hook="parent_layer"
  }}`);

  const fooLayer = $hook('parent_layer');
  const fooLayerDirectables = fooLayer.children(hook('simple_directable'));
  assert.equal(fooLayerDirectables.length, 1, 'foo layer directables rendered');
  assert.equal(fooLayerDirectables.first().text().trim(), 'foo', 'correct foo layer filter');

  const fooBarLayer = fooLayer.children('.et-layer-foo-bar');
  const fooBarLayerDirectables = fooBarLayer.children(hook('simple_directable'));
  assert.equal(fooBarLayer.length, 1, 'foo-bar layer rendered');
  assert.equal(fooBarLayerDirectables.length, 1, 'foo-bar layer directables rendered');
  assert.equal(fooBarLayerDirectables.first().text().trim(), 'foo.bar', 'correct foo-bar layer filter');

  const fooBarBazLayer = fooBarLayer.children('.et-layer-foo-bar-baz');
  const fooBarBazLayerDirectables = fooBarBazLayer.children(hook('simple_directable'));
  assert.equal(fooBarBazLayer.length, 1, 'foo-bar-baz layer rendered');
  assert.equal(fooBarBazLayerDirectables.length, 1, 'foo-bar-baz layer directables rendered');
  assert.equal(fooBarBazLayerDirectables.first().text().trim(), 'foo.bar.baz', 'correct foo-bar-baz layer filter');

  const fooBazLayer = fooLayer.children('.et-layer-foo-baz');
  const fooBazLayerDirectables = fooBazLayer.children(hook('simple_directable'));
  assert.equal(fooBazLayer.length, 1, 'foo-baz layer rendered');
  assert.equal(fooBazLayerDirectables.length, 0, 'foo-bar layer directables rendered');

  const fooBazFooLayer = fooBazLayer.children('.et-layer-foo-baz-foo');
  const fooBazFooLayerDirectables = fooBazFooLayer.children(hook('simple_directable'));
  assert.equal(fooBazFooLayer.length, 1, 'foo-baz-foo layer rendered');
  assert.equal(fooBazFooLayerDirectables.length, 1, 'foo-baz-foo layer directables rendered');
  assert.equal(fooBazFooLayerDirectables.first().text().trim(), 'foo.baz.foo', 'correct foo-baz-foo layer filter');
});
