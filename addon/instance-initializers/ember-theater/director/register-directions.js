import Ember from 'ember';
import { gatherTypes } from 'ember-theater';

const {
  get
} = Ember;

const { String: { camelize } } = Ember;

const applyName = function applyName(appInstance, { camelizedName, dasherizedNamed }) {
  const factory = appInstance.lookup(`ember-theater/director/direction:${dasherizedNamed}`);

  factory.reopen({
    _name: camelizedName
  });
};

const injectIntoScript = function injectIntoScript(appInstance, { camelizedName, dasherizedNamed }) {
  const directorProxy = function directorProxy(...args) {
    // the scene is the context here
    const factory = appInstance.lookup(`ember-theater/director/direction:${dasherizedNamed}`);

    return get(this, 'director').direct(this, factory, args);
  };

  appInstance.register(`ember-theater/director/direction-proxy/script:${dasherizedNamed}`, directorProxy, { instantiate: false });
  appInstance.inject('ember-theater/director:script', camelizedName, `ember-theater/director/direction-proxy/script:${dasherizedNamed}`);
};

const injectIntoScriptProxy = function injectIntoScriptProxy(appInstance, { camelizedName, dasherizedNamed }) {
  const scriptProxy = function scriptProxy(...args) {
    // the scene proxy is the context here
    const predecessors = get(this, 'predecessors');

    predecessors[0].trigger('willChainDirection', camelizedName, args);

    return get(this, 'script')[camelizedName](predecessors, ...args);
  };

  appInstance.register(`ember-theater/director/script-proxy/script:${dasherizedNamed}`, scriptProxy, { instantiate: false });
  appInstance.inject('ember-theater/director:script-proxy', camelizedName, `ember-theater/director/script-proxy/script:${dasherizedNamed}`);
};

export function initialize(appInstance) {
  appInstance.registerOptionsForType('ember-theater/director/direction', { instantiate: false });

  gatherTypes(appInstance, 'ember-theater/director/direction').forEach((dasherizedNamed) => {
    const camelizedName = camelize(dasherizedNamed);
    const nameMap = { camelizedName, dasherizedNamed };

    applyName(appInstance, nameMap);
    injectIntoScript(appInstance, nameMap);
    injectIntoScriptProxy(appInstance, nameMap);
  });
}

export default {
  name: 'ember-theater/director/register-directions',
  initialize
};
