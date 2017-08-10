import { Scene, step } from 'affinity-engine-stage';
import { task } from 'ember-concurrency';

export default Scene.extend({
  name: 'Basic Direction',

  start: task(function * (script) {
    const basic1 = script.basic('Syncronous Header');

    yield step();

    basic1.configure('text', 'foo');

    yield step();

    const basic2 = yield script.basic('Asyncronous Header');

    yield step();

    basic2.configure('text', 'foo');

    yield step();

    script.basic('Uninstantiated Header').configure('text', 'bar');

    yield step();

    script.appender('alpha').link(['foo', 'stage.component.basic'], 'footerSecondary', 'omega')._.basic('Chained Header').configure('text', 'baz');
  })
});
