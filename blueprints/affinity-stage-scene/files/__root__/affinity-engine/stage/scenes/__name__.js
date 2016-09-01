import { Scene } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: '<%= capitalizedModuleName %>',

  start: task(function * (script) {
    
  })
});
