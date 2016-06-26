export function initialize(appInstance) {
  appInstance.registerOptionsForType('affinity-engine/stage/scene', { instantiate: false });
}

export default {
  name: 'affinity-engine/stage/register-scenes',
  initialize
};
