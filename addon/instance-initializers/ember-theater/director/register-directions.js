import Ember from 'ember';
import { gatherTypes } from 'ember-theater';
import { Script, ScriptProxy } from 'ember-theater-director';

const { String: { camelize } } = Ember;

const applyName = function applyName(appInstance, camelizedName, dasherizedNamed) {
  const factory = appInstance.lookup(`ember-theater/director/direction:${dasherizedNamed}`);

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
  appInstance.registerOptionsForType('ember-theater/director/direction', { instantiate: false });

  gatherTypes(appInstance, 'ember-theater/director/direction').forEach((dasherizedNamed) => {
    const camelizedName = camelize(dasherizedNamed);

    applyName(appInstance, camelizedName, dasherizedNamed);
    injectIntoScript(appInstance, camelizedName, dasherizedNamed, Script);
    injectIntoScript(appInstance, camelizedName, camelizedName, ScriptProxy);
  });
}

export default {
  name: 'ember-theater/director/register-directions',
  initialize
};
