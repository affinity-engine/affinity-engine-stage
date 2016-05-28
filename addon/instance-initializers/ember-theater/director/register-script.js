import { Script } from 'ember-theater-director';
import { ScriptProxy } from 'ember-theater-director';

export function initialize(appInstance) {
  appInstance.register('ember-theater/director:script', Script, { singleton: false, instantiate: false });
  appInstance.register('ember-theater/director:script-proxy', ScriptProxy, { singleton: false, instantiate: false });
}

export default {
  name: 'ember-theater/director/register-script',
  initialize
};
