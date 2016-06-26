import Ember from 'ember';
import { gatherTypes } from 'affinity-engine';
import { Script, ScriptProxy } from 'affinity-engine-stage';

const { String: { camelize } } = Ember;

const applyName = function applyName(appInstance, camelizedName, dasherizedNamed) {
  const factory = appInstance.lookup(`affinity-engine/stage/direction:${dasherizedNamed}`);

  factory.reopen({
    directionName: camelizedName
  });
};

const injectIntoScript = function injectIntoScript(appInstance, camelizedName, dasherizedOrCamelizedNamed, ClassType) {
  const directionProxy = { };

  directionProxy[camelizedName] = function(...args) {
    // the scene is the context here
    return this._executeDirection(dasherizedOrCamelizedNamed, args);
  };

  ClassType.reopen(directionProxy);
};

export function initialize(appInstance) {
  appInstance.registerOptionsForType('affinity-engine/stage/direction', { instantiate: false });

  gatherTypes(appInstance, 'affinity-engine/stage/direction').forEach((dasherizedNamed) => {
    const camelizedName = camelize(dasherizedNamed);

    applyName(appInstance, camelizedName, dasherizedNamed);
    injectIntoScript(appInstance, camelizedName, dasherizedNamed, Script);
    injectIntoScript(appInstance, camelizedName, camelizedName, ScriptProxy);
  });
}

export default {
  name: 'affinity-engine/stage/register-directions',
  initialize
};
