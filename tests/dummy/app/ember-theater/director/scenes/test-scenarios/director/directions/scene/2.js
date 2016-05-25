import { Scene, step } from 'ember-theater-director';

export default Scene.extend({
  name: 'Scene Change 2',

  start: async function(script) {
    script.basic('Scene Two');

    await step();

    script.scene('test-scenarios/director/directions/scene/3').window('simple-window');
    script.scene('test-scenarios/director/directions/scene/4').window('window-with-screen').screen('foo');
  }
});
