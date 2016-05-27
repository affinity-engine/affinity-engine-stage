import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Basic Direction',

  start: async function(script) {
    const basic1 = script.Basic('First Basic Header');

    await step();

    basic1.text('foo');

    await step();

    script.Basic('Second Basic Header').text('bar');

    await step();

    script.Appender('alpha').secondary('omega').Basic('Third Basic Header').text('baz');
  }
});
