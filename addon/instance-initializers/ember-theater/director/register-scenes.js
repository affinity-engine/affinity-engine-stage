export function initialize(appInstance) {
  appInstance.registerOptionsForType('ember-theater/director/scene', { instantiate: false });
}

export default {
  name: 'ember-theater/director/register-scenes',
  initialize
};
