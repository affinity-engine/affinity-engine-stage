import { Scene } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: 'Scene Change 4',

  start: task(function * (script) {
    yield script.basic('Scene Four');
  })
});
