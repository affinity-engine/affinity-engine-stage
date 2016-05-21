import gatherModules from 'ember-theater/utils/gather-modules';

export function initialize(appInstance) {
  const scenes = gatherModules('ember-theater\/director\/scenes');

  scenes.forEach((scene, sceneName) => {
    appInstance.register(`ember-theater/director/scene:${sceneName}`, scene, { instantiate: false, singleton: false });
  });
}

export default {
  name: 'ember-theater/director/register-scenes',
  initialize
};
