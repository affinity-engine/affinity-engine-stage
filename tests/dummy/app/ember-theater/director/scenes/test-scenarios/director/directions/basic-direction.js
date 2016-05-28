import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Basic Direction',

  start: async function(script) {
    const basic1 = script.basic('First Basic Header');

    await step();

    basic1.text('foo');

    await step();

    script.basic('Second Basic Header').text('bar');

    await step();

    script.appender('alpha').secondary('omega')._.basic('Third Basic Header').text('baz');
  }
});
