import { Scene, step } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: 'Basic Direction',

  start: task(function * (script) {
    const basic1 = script.basic('Syncronous Header');

    yield step();

    basic1.text('foo');

    yield step();

    const basic2 = yield script.basic('Asyncronous Header');

    yield step();

    basic2.text('foo');

    yield step();

    script.basic('Uninstantiated Header').text('bar');

    yield step();

    script.appender('alpha').secondary('omega')._.basic('Chained Header').text('baz');
  })
});
