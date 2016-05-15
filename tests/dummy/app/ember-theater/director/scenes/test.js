import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Test',

  start: async function(script) {
    const test1 = script.Test('First Test Header');

    await step();

    test1.text('foo');

    await step();

    script.Test('Second Test Header').text('bar');

    await step();

    script.Foot('alpha').secondary('omega').Test('Third Test Header').text('baz');
  }
});
