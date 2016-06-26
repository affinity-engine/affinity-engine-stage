import { Script } from 'affinity-engine-stage';
import { ScriptProxy } from 'affinity-engine-stage';

export function initialize(appInstance) {
  appInstance.register('affinity-engine/stage:script', Script, { singleton: false, instantiate: false });
  appInstance.register('affinity-engine/stage:script-proxy', ScriptProxy, { singleton: false, instantiate: false });
}

export default {
  name: 'affinity-engine/stage/register-script',
  initialize
};
