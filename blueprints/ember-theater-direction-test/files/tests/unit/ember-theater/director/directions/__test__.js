import <%= classifiedModuleName %> from '<%= dasherizedPackageName %>/ember-theater/director/directions/<%= dasherizedModuleName %>';
import { module, test } from 'qunit';

module('Unit | Ember Theater Direction | <%= dasherizedModuleName %>');

// Replace this with your real tests.
test('it works', function(assert) {
  var <%= camelizedModuleName %> = <%= classifiedModuleName %>.create();
  assert.ok(<%= camelizedModuleName %>);
});
