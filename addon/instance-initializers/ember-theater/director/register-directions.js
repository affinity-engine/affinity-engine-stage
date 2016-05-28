import Ember from 'ember';
import { gatherTypes } from 'ember-theater';

const { String: { camelize } } = Ember;

const applyName = function applyName(appInstance, camelizedName, dasherizedNamed) {
  const factory = appInstance.lookup(`ember-theater/director/direction:${dasherizedNamed}`);

  factory.reopen({
    _name: camelizedName
  });
};

const injectIntoScript = function injectIntoScript(appInstance, camelizedName, dasherizedNamed) {
  const directorProxy = function directorProxy(...args) {
    // the scene is the context here
    return this._executeDirection(dasherizedNamed, args);
  };

  appInstance.register(`ember-theater/director/direction-proxy/script:${dasherizedNamed}`, directorProxy, { instantiate: false });
  appInstance.inject('ember-theater/director:script', camelizedName, `ember-theater/director/direction-proxy/script:${dasherizedNamed}`);
};

const injectIntoScriptProxy = function injectIntoScriptProxy(appInstance, camelizedName, dasherizedNamed) {
  const scriptProxy = function scriptProxy(...args) {
    // the scene proxy is the context here
    return this._executeDirection(camelizedName, args);
  };

  appInstance.register(`ember-theater/director/script-proxy/script:${dasherizedNamed}`, scriptProxy, { instantiate: false });
  appInstance.inject('ember-theater/director:script-proxy', camelizedName, `ember-theater/director/script-proxy/script:${dasherizedNamed}`);
};

export function initialize(appInstance) {
  appInstance.registerOptionsForType('ember-theater/director/direction', { instantiate: false });

  gatherTypes(appInstance, 'ember-theater/director/direction').forEach((dasherizedNamed) => {
    const camelizedName = camelize(dasherizedNamed);

    applyName(appInstance, camelizedName, dasherizedNamed);
    injectIntoScript(appInstance, camelizedName, dasherizedNamed);
    injectIntoScriptProxy(appInstance, dasherizedNamed, camelizedName);
  });
}

export default {
  name: 'ember-theater/director/register-directions',
  initialize
};
