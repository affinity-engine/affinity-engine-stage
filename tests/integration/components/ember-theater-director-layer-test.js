import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { initialize as initializeHook } from 'ember-hook';
import { initialize as initializeMultitons } from 'ember-multiton-service';

const {
  getOwner
} = Ember;

moduleForComponent('ember-theater-director-layer', 'Integration | Component | ember theater director layer', {
  integration: true,

  beforeEach() {
    initializeHook();
    initializeMultitons(getOwner(this));
  }
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.set('directables', Ember.A());

  this.render(hbs`{{ember-theater-director-layer
    directables=directables
    name=''
  }}`);

  assert.equal(this.$().text().trim(), '');
});
