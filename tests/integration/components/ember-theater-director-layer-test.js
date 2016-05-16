import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { $hook, initialize as initializeHook } from 'ember-hook';
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
